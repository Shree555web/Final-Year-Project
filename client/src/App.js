import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register'; 
import Login from './Login';
import Dashboard from './Dashboard';
import SubjectLab from './SubjectLab';
import Quiz from './Quiz';
import StudyMaterial from './StudyMaterial';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main App Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lab/:subjectId" element={<SubjectLab />} />
        <Route path="/quiz/:subjectId" element={<Quiz />} />
        <Route path="/study/:subjectId" element={<StudyMaterial />} />
        
        {/* Redirect for unknown paths (Keep this at the bottom) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;