import { Chessboard } from "react-chessboard";
import './App.css'

function App() {

  return (
      <div style={{ width: "500px", height: "500px", margin: "auto"}}>
        <Chessboard id="defaultBoard"/>
      </div>
  );
}

export default App
