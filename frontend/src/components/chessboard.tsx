import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState } from "react";

function RenderChessboard() {

    const [game, setGame] = useState(new Chess());

    const onDrop = (sourceSquare: string, targetSquare: string, piece: string): boolean => {
        const gameCopy = new Chess(game.fen());

        const move = gameCopy.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // Always promote to a queen for simplicity
        });
    
        if (move) {
          setGame(gameCopy);
          return true;
        }

        return false;
    }

    return (
        <div>
            <Chessboard id="defaultBoard" position={game.fen()} onPieceDrop={onDrop}/>
        </div>
        );
}

export default RenderChessboard;