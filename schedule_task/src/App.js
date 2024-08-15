import React from 'react';
import MentorAvailability from './components/MentorAvailability';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup  from'./Signup';
import Login from './Login';
import View from './View';

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
        <Route path="/" element={<MentorAvailability/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/view" element={<View />} />
        <Route path="/signup" element={<Signup />} />
        </Routes>
        </Router>
    </div>
  );
}

export default App;
