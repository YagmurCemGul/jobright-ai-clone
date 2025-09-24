import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSearchPage from './pages/JobSearchPage';
import ResumePage from './pages/ResumePage';
import setAuthToken from './utils/setAuthToken';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      setIsAuthenticated(true);
    }
    // Set up an event listener to handle storage changes from other tabs
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <>
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <ToastContainer />
        <div className="container">
          <Routes>
            <Route path="/" element={<JobSearchPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="/search" element={<JobSearchPage />} />
            <Route path="/resume" element={<ResumePage />} />
          </Routes>
        </div>
      </>
    </Router>
  );
}

export default App;
