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
            if (move.captured) {
              console.log(`${piece} captured: ${move.captured}`); // Logs the captured piece type (e.g., 'p' for pawn)
            }
        }

        if (gameCopy.isCheckmate()) {
          console.log("Checkmate! Game over."); // Logs checkmate state
          // You could display a message or trigger a game reset here
        }
    
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