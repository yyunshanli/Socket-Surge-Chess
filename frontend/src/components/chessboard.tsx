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
  const [moveLog, setMoveLog] = useState<{ white: string; black?: string }[]>(
    []
  );

  useEffect(() => {
    socket.emit("findGame");

    socket.on("connect", () => {
      console.log("[Client] Connected to backend:", socket.id);
    });

    socket.on("start", ({ color, roomId, fen }) => {
      console.log(`[Client] Game started as ${color} in room ${roomId}`);
      setColor(color);
      setRoomId(roomId);

      const newGame = new Chess();
      newGame.load(fen);
      setGame(newGame);
      setMoveLog([]);
    });

    socket.on("board", ({ fen, history }) => {
      console.log("[SOCKET] Received board update:", { fen, history });

      setGame((prevGame) => {
        const updated = new Chess();
        try {
          updated.load(fen);
        } catch (e) {
          console.error("[CLIENT] Failed to load FEN:", fen, e);
          return prevGame;
        }

        const formattedLog: { white: string; black?: string }[] = [];

        for (let i = 0; i < history.length; i += 2) {
          formattedLog.push({
            white: history[i]?.san,
            black: history[i + 1]?.san,
          });
        }

        setMoveLog(formattedLog);
        return updated;
      });
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

    const isWhitesTurn = game.turn() === "w";
    const isPlayerWhite = color === "white";

    if ((isWhitesTurn && !isPlayerWhite) || (!isWhitesTurn && isPlayerWhite)) {
      return false;
    }

    const pieceAtSource = game.get(sourceSquare);
    if (
      !pieceAtSource ||
      (isPlayerWhite && pieceAtSource.color !== "w") ||
      (!isPlayerWhite && pieceAtSource.color !== "b")
    ) {
      return false;
    }

    const tempGame = new Chess(game.fen());
    const move = tempGame.move({
      from: sourceSquare,
      to: targetSquare,
    });

    if (!move) return false;

    socket.emit("move", {
      roomId,
      move: { from: sourceSquare, to: targetSquare },
    });

    return true;
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen px-4 py-6">
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
          <h2 className="text-xl font-semibold mb-6 text-center">
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

          <div className="flex flex-col lg:flex-row items-start justify-start gap-8 w-full px-4">
            {/* Board */}
            <div className="flex justify-center w-full lg:w-[700px]">
              <Chessboard
                id="defaultBoard"
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={color}
                boardWidth={640}
              />
            </div>

            {/* Move Log */}
            <div className="bg-base-100 border rounded p-5 w-full lg:w-[400px] text-sm shadow">
              <h3 className="font-semibold mb-3 text-center text-lg">
                Move Log
              </h3>
              <table className="w-full text-left table-fixed">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-700">
                    <th className="w-[30px] pr-2">#</th>
                    <th className="w-[150px] pr-2 truncate">White</th>
                    <th className="w-[150px] truncate">Black</th>
                  </tr>
                </thead>
                <tbody>
                  {moveLog.map((entry, index) => (
                    <tr key={index}>
                      <td className="pr-2">{index + 1}.</td>
                      <td className="pr-2 truncate">{entry.white}</td>
                      <td className="truncate">{entry.black || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RenderChessboard;
