const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("../frontend"));

let chess = new Chess();

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // inital board
  socket.emit("board", chess.fen());

  // moves
  socket.on("move", (move) => {
    try {
      const result = chess.move(move);
      if (result) {
        io.emit("board", chess.fen()); // updated board
      } else {
        socket.emit("error", "Invalid move");
      }
    } catch (err) {
      socket.emit("error", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("A player disconnected:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
