const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("../frontend"));

const waitingPlayers = [];
const games = {}; // roomId => { game, players: { white, black } }
const playerToRoomMap = {};

io.on("connection", (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  socket.on("findGame", () => {
    console.log(`[MATCHMAKING] ${socket.id} is looking for a game`);

    if (playerToRoomMap[socket.id]) {
      console.log(
        `[IGNORED] ${socket.id} is already in a game (${
          playerToRoomMap[socket.id]
        })`
      );
      return;
    }

    const opponentSocket = waitingPlayers.find((s) => s.id !== socket.id);

    if (opponentSocket) {
      // Remove opponent from waiting queue
      const index = waitingPlayers.indexOf(opponentSocket);
      if (index !== -1) waitingPlayers.splice(index, 1);

      const roomId = `${opponentSocket.id}-${socket.id}`;
      const chess = new Chess();

      games[roomId] = {
        game: chess,
        players: {
          white: opponentSocket.id,
          black: socket.id,
        },
      };

      playerToRoomMap[socket.id] = roomId;
      playerToRoomMap[opponentSocket.id] = roomId;

      // Join room
      socket.join(roomId);
      opponentSocket.join(roomId);

      console.log(`[MATCH] Room created: ${roomId}`);
      console.log(`    - White: ${opponentSocket.id}`);
      console.log(`    - Black: ${socket.id}`);

      io.to(opponentSocket.id).emit("start", {
        color: "white",
        roomId,
        fen: chess.fen(),
      });

      io.to(socket.id).emit("start", {
        color: "black",
        roomId,
        fen: chess.fen(),
      });
    } else {
      if (!waitingPlayers.find((s) => s.id === socket.id)) {
        waitingPlayers.push(socket);
        console.log(`[WAITING] No opponents. ${socket.id} is now waiting.`);
      } else {
        console.log(`[INFO] ${socket.id} is already in the waiting queue.`);
      }
    }
  });

  socket.on("move", ({ roomId, move }) => {
    console.log(`[MOVE] Room: ${roomId}, Player: ${socket.id}, Move:`, move);
    const gameData = games[roomId];
    if (!gameData) {
      console.log(`[!] No game found for roomId: ${roomId}`);
      return;
    }

    const chess = gameData.game;

    try {
      const result = chess.move(move);
      if (result) {
        const fen = chess.fen();
        const history = chess.history({ verbose: true });

        console.log(`[VALID MOVE] ${move.from} -> ${move.to}`);
        console.log(
          `[SERVER] Emitting updated board + history to room ${roomId}`
        );

        io.to(roomId).emit("board", {
          fen,
          history,
        });
      } else {
        console.log(`[INVALID MOVE] ${move.from} -> ${move.to}`);
        socket.emit("error", "Invalid move");
      }
    } catch (err) {
      console.log(`[ERROR] Move failed:`, err.message);
      socket.emit("error", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[-] Player disconnected: ${socket.id}`);

    const index = waitingPlayers.findIndex((s) => s.id === socket.id);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      console.log(`[CLEANUP] Removed ${socket.id} from waiting queue`);
    }

    const roomId = playerToRoomMap[socket.id];
    if (roomId) {
      delete playerToRoomMap[socket.id];
      console.log(
        `[CLEANUP] Removed ${socket.id} from game room map (${roomId})`
      );
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
