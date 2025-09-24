import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const res = await axios.get('/api/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleNotificationClick = async (notification) => {
    try {
      await axios.post(`/api/notifications/${notification._id}/read`);
      setNotifications(
        notifications.map((n) =>
          n._id === notification._id ? { ...n, read: true } : n
        )
      );
      setShowNotifications(false);
      navigate(notification.link);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const authLinks = (
    <ul>
      <li>
        <Link to="/search">Search Jobs</Link>
      </li>
      {user?.role === 'employer' && (
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
      )}
      {user?.role === 'job_seeker' && (
        <li>
          <Link to="/resume">My Resume</Link>
        </li>
      )}
      <li style={{ position: 'relative' }}>
        <button onClick={() => setShowNotifications(!showNotifications)}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </button>
        {showNotifications && (
          <div style={{ position: 'absolute', top: '100%', right: 0, border: '1px solid #ccc', backgroundColor: 'white', zIndex: 100 }}>
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: n.read ? 'transparent' : '#f0f8ff' }}
                >
                  {n.message}
                </div>
              ))
            ) : (
              <div style={{ padding: '10px' }}>No notifications</div>
            )}
          </div>
        )}
      </li>
      <li>
        <a onClick={logout} href="#!">
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
      <li>
        <Link to="/search">Search Jobs</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/employer/register">For Employers</Link>
      </li>
    </ul>
  );

  return (
    <nav>
      <h1>
        <Link to="/">JobRight Clone</Link>
      </h1>
      {isAuthenticated ? authLinks : guestLinks}
    </nav>
  );
};

export default Navbar;
