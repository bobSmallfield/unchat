import './App.css';
// import './App-whatsapp.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home"
import Room from "./pages/Room"

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/:roomName" exact element={<Room />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
