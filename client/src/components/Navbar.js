import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <h1>
        <Link to="/">JobRight Clone</Link>
      </h1>
      <ul>
        <li>
          <Link to="/login">Login</Link>
        </li>
        <li>
          <Link to="/register">Register</Link>
        </li>
        <li>
          <Link to="/search">Search Jobs</Link>
        </li>
        <li>
          <Link to="/resume">Upload Resume</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
