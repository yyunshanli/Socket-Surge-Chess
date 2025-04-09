import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

function RenderChessboard() {
  const [game, setGame] = useState(new Chess());
  const [color, setColor] = useState<"white" | "black">("white");
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Client] Finding game...");
    socket.emit("findGame");

    socket.on("connect", () => {
      console.log("[Client] Connected to backend:", socket.id);
    });

    socket.on("start", ({ color, roomId, fen }) => {
      console.log(`[Client] Game started as ${color} in room ${roomId}`);
      setColor(color);
      setRoomId(roomId);
      setGame(new Chess(fen));
    });

    socket.on("board", (fen) => {
      console.log("[Client] Board updated:", fen);
      setGame(new Chess(fen));
    });

    socket.on("error", (msg) => {
      console.error("[Client Error]", msg);
      alert(msg);
    });

    return () => {
      socket.off("start");
      socket.off("board");
      socket.off("error");
    };
  }, []);

  const onDrop = (
    sourceSquare: string,
    targetSquare: string,
    piece: string
  ): boolean => {
    if (!roomId) return false;

    // Send move to server
    socket.emit("move", {
      roomId,
      move: { from: sourceSquare, to: targetSquare },
    });

    return true; // Let server confirm the move
  };

  return (
    <div className="p-5 m-10">
      <Chessboard
        id="defaultBoard"
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation={color} // Rotate board based on assigned color
      />
    </div>
  );
}

export default RenderChessboard;
