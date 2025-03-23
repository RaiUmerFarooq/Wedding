import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import EventManager from './components/EventManager';
import GuestContributions from './components/GuestContributions';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Our Nikkah & Shalima</h1>
        <nav className="app-nav">
          <Link to="/">Event Manager</Link>
          <Link to="/contributions">Guest Contributions</Link>
        </nav>
        <Routes>
          <Route path="/" element={<EventManager />} />
          <Route path="/contributions" element={<GuestContributions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;