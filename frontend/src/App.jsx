import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VideoFeed from "./VideoFeed";
import LogsPage from "./LogsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoFeed />} />
        <Route path="/logs" element={<LogsPage />} />
      </Routes>
    </Router>
  );
}

export default App;