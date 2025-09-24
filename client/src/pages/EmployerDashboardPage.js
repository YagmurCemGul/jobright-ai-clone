import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const EmployerDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        // This endpoint needs to be created to fetch jobs for the logged-in employer
        const res = await axios.get('/api/jobs/my-jobs');
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchJobs();
  }, []);

  return (
    <div>
      <h1>Employer Dashboard</h1>
      <Link to="/jobs/new">Create New Job Posting</Link>
      <hr />
      <h2>Your Job Listings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>{job.title}</h3>
                <p>{job.location}</p>
                <Link to={`/jobs/${job._id}/applicants`}>View Applicants ({job.applicants.length})</Link>
              </div>
            ))
          ) : (
            <p>You have not posted any jobs yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployerDashboardPage;