import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSearchPage from './pages/JobSearchPage';
import ResumePage from './pages/ResumePage';
import EmployerRegisterPage from './pages/EmployerRegisterPage';
import EmployerDashboardPage from './pages/EmployerDashboardPage';
import JobCreatePage from './pages/JobCreatePage';
import ApplicantsPage from './pages/ApplicantsPage';
import EmployerRoute from './components/EmployerRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<JobSearchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/employer/register" element={<EmployerRegisterPage />} />
              <Route path="/search" element={<JobSearchPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/dashboard" element={<EmployerRoute><EmployerDashboardPage /></EmployerRoute>} />
              <Route path="/jobs/new" element={<EmployerRoute><JobCreatePage /></EmployerRoute>} />
              <Route path="/jobs/:id/applicants" element={<EmployerRoute><ApplicantsPage /></EmployerRoute>} />
            </Routes>
          </div>
        </>
      </Router>
    </AuthProvider>
  );
}

export default App;
