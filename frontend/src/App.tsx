
import RenderChessboard from './components/chessboard';
import './App.css'

// Router imports
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Page imports
import NavBar from './components/navbar';

const NavbarItems = [
  {name:"Home", id:0}, 
  {name:"Contact", id:1}, 
  {name:"Learn more", id:2}];

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<NavBar navItems={NavbarItems}/>}>
          <Route index element={
                  <div style={{ width: "33%", height: "33%", margin: "auto"}}>
                  <RenderChessboard/>
                </div>
          }/>
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App
