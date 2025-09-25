import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (localStorage.token) {
        try {
          const config = {
            headers: { 'x-auth-token': localStorage.token },
          };
          const res = await axios.get('/api/notifications', config);
          setNotifications(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };

    if (isAuthenticated) {
      fetchNotifications(); // Initial fetch
      const intervalId = setInterval(fetchNotifications, 15000); // Fetch every 15 seconds
      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [isAuthenticated]);

  const onToggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    // When opening the dropdown, mark notifications as read and refetch
    if (!showNotifications && notifications.some(n => !n.read)) {
      try {
        const config = { headers: { 'x-auth-token': localStorage.token } };
        await axios.post('/api/notifications/mark-read', null, config);

        // Refetch all notifications to get the updated read status
        const res = await axios.get('/api/notifications', config);
        setNotifications(res.data);

      } catch (err) {
        console.error(err);
      }
    }
  };

  const authLinks = (
    <Fragment>
      <li>
        <Link to="/search">Search Jobs</Link>
      </li>
      <li>
        <Link to="/resume">Upload Resume</Link>
      </li>
      <li>
        <Link to="/network">My Network</Link>
      </li>
      <li>
        <button onClick={onToggleNotifications}>
          Notifications {notifications.filter(n => !n.read).length > 0 && `(${notifications.filter(n => !n.read).length})`}
        </button>
        {showNotifications && (
          <div className="notifications-dropdown">
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification._id} style={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                    {notification.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No new notifications.</p>
            )}
          </div>
        )}
      </li>
      <li>
        <a onClick={onLogout} href="#!">
          Logout
        </a>
      </li>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <li>
        <Link to="/login">Login</Link>
      </li>
      <li>
        <Link to="/register">Register</Link>
      </li>
    </Fragment>
  );

  return (
    <nav>
      <h1>
        <Link to="/">JobRight Clone</Link>
      </h1>
      <ul>{isAuthenticated ? authLinks : guestLinks}</ul>
    </nav>
  );
};

export default Navbar;