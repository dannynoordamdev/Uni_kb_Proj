import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Timeline from "./Components/TimelinePage";
import "./App.css";
import React from "react";
import WorldMap from "./Components/WorldMap";


function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tijdlijn" element={<Timeline />} />
        

        </Routes>
      </Router>
    </>
      );
}

export default App;
