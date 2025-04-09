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

    // Only allow moving your own pieces
    const isWhitesTurn = game.turn() === "w";
    const isPlayerWhite = color === "white";

    if ((isWhitesTurn && !isPlayerWhite) || (!isWhitesTurn && isPlayerWhite)) {
      console.log("[Client] Not your turn.");
      return false;
    }

    // Check that the piece belongs to you
    const pieceAtSource = game.get(sourceSquare);
    if (
      !pieceAtSource ||
      (isPlayerWhite && pieceAtSource.color !== "w") ||
      (!isPlayerWhite && pieceAtSource.color !== "b")
    ) {
      console.log("[Client] You can only move your own pieces.");
      return false;
    }

    // Valid so far — emit move to server
    socket.emit("move", {
      roomId,
      move: { from: sourceSquare, to: targetSquare },
    });

    return true;
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      {!roomId ? (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            Looking for opponent...
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full"></span>
            <span className="text-sm text-gray-500">
              Waiting for an opponent…
            </span>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-lg font-medium mb-4">
            You are playing as{" "}
            <span
              className={
                color === "white"
                  ? "text-white bg-black px-2 py-1 rounded"
                  : "text-black bg-white px-2 py-1 rounded"
              }
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </span>
          </h2>

          <div
            style={{ width: "56%", height: "57%", margin: "auto" }}
            className="border rounded shadow-lg"
          >
            <Chessboard
              id="defaultBoard"
              position={game.fen()}
              onPieceDrop={onDrop}
              boardOrientation={color}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RenderChessboard;
