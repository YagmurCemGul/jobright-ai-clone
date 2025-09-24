import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salary: '',
  });

  const { title, description, location, jobType, salary } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/jobs', formData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Job Title"
        name="title"
        value={title}
        onChange={onChange}
        required
      />
      <textarea
        placeholder="Job Description"
        name="description"
        value={description}
        onChange={onChange}
        required
      />
      <input
        type="text"
        placeholder="Location"
        name="location"
        value={location}
        onChange={onChange}
        required
      />
      <select name="jobType" value={jobType} onChange={onChange}>
        <option value="Full-time">Full-time</option>
        <option value="Part-time">Part-time</option>
        <option value="Contract">Contract</option>
        <option value="Internship">Internship</option>
      </select>
      <input
        type="number"
        placeholder="Salary (optional)"
        name="salary"
        value={salary}
        onChange={onChange}
      />
      <input type="submit" value="Create Job" />
    </form>
  );
};

export default JobForm;