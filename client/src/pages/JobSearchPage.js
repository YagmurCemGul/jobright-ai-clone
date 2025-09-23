import React, { useState } from 'react';
import axios from 'axios';
import JobList from '../components/JobList';

const JobSearchPage = () => {
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
  });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const { keywords, location } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/jobs/search?keywords=${keywords}&location=${location}`
      );
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Job Search</h1>
      <form onSubmit={onSubmit}>
        <div>
          <input
            type="text"
            placeholder="Keywords"
            name="keywords"
            value={keywords}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Location"
            name="location"
            value={location}
            onChange={onChange}
          />
        </div>
        <input type="submit" value="Search" />
      </form>
      {loading ? <p>Loading...</p> : <JobList jobs={jobs} />}
    </div>
  );
};

export default JobSearchPage;
