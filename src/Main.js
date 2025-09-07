import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/ui/header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import companyDashbord from './pages/CompanyDashboard';
import StudentDashboard from './pages/studentDashboard';
import ResumePredictor from './pages/ResumePredictor';


function Main() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/studentDashboard" element={<StudentDashboard />} />
        <Route path="/CompanyDashboard" element={<companyDashbord />} />
        <Route path="/ResumePredictor" element={<ResumePredictor />} /> {/* New */}
      </Routes>
    </Router>
  );
}

export default Main;