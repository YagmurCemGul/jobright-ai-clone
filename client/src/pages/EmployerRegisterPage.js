import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const EmployerRegisterPage = () => {
  const { registerEmployer, isAuthenticated, error } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    website: '',
    location: '',
    description: '',
  });

  const { name, email, password, companyName, website, location, description } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    registerEmployer(formData);
  };

  return (
    <div>
      <h1>Register as an Employer</h1>
      <form onSubmit={onSubmit}>
        {error && <p>{error}</p>}
        <input
          type="text"
          placeholder="Your Name"
          name="name"
          value={name}
          onChange={onChange}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={email}
          onChange={onChange}
          required
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={onChange}
          minLength="6"
          required
        />
        <hr />
        <h3>Company Information</h3>
        <input
          type="text"
          placeholder="Company Name"
          name="companyName"
          value={companyName}
          onChange={onChange}
          required
        />
        <input
          type="text"
          placeholder="Company Website"
          name="website"
          value={website}
          onChange={onChange}
        />
        <input
          type="text"
          placeholder="Location"
          name="location"
          value={location}
          onChange={onChange}
        />
        <textarea
          placeholder="Company Description"
          name="description"
          value={description}
          onChange={onChange}
        />
        <input type="submit" value="Register" />
      </form>
    </div>
  );
};

export default EmployerRegisterPage;