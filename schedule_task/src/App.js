import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import MentorAvailability from './components/MentorAvailability';
import ScheduleMeeting from './components/ScheduleMeeting';
import MentorSignupForm from './MentorSignup';
import StudentSignupForm from './StudentSignupForm';
import StudentLoginPage from './SudentLogin';
import MentorLoginForm from './MentorLogin';
import LoginSelection from './LoginSelection';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LoginSelection />} />
          <Route path="/mentorsignup" element={<MentorSignupForm />} />
          <Route path="/studentsignup" element={<StudentSignupForm />} />
          <Route path="/mentoravailability" element={<MentorAvailability />} />
          <Route path="/schedulemeeting" element={<ScheduleMeeting />} />
          <Route path="/studentlogin" element={<StudentLoginPage />} />
          <Route path="/mentorlogin" element={<MentorLoginForm />} />
          <Route path="/student" element={<ScheduleMeeting />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
