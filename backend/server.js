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

io.on("connection", (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  socket.on("findGame", () => {
    console.log(`[MATCHMAKING] ${socket.id} is looking for a game`);

    const opponent = waitingPlayers.find((s) => s.id !== socket.id);

    if (opponent) {
      // Remove opponent from queue
      const index = waitingPlayers.indexOf(opponent);
      if (index !== -1) waitingPlayers.splice(index, 1);

      const roomId = `${opponent.id}-${socket.id}`;
      const chess = new Chess();

      games[roomId] = {
        game: chess,
        players: {
          white: opponent.id,
          black: socket.id,
        },
      };

      opponent.join(roomId);
      socket.join(roomId);

      console.log(`[MATCH] Room created: ${roomId}`);
      console.log(`    - White: ${opponent.id}`);
      console.log(`    - Black: ${socket.id}`);

      io.to(opponent.id).emit("start", {
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
      // Only push if not already in waitingPlayers
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
        console.log(`[VALID MOVE] ${move.from} -> ${move.to}`);
        io.to(roomId).emit("board", chess.fen());
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

    // Remove from waiting list if present
    const index = waitingPlayers.findIndex((s) => s.id === socket.id);
    if (index !== -1) {
      waitingPlayers.splice(index, 1);
      console.log(`[CLEANUP] Removed ${socket.id} from waiting queue`);
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
