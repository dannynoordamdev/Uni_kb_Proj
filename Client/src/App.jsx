import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Timeline from "./Components/Timeline";
import "./App.css";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />

        </Routes>
      </Router>
    </>
      );
}

export default App;
