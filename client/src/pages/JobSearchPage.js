import React, { useState, useEffect } from 'react';
import axios from 'axios';

const JobSearchPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    jobType: '',
  });

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { keywords, location, jobType } = filters;
        const res = await axios.get('/api/jobs', {
          params: { keywords, location, jobType },
        });
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/apply`);
      alert('Successfully applied for the job!');
    } catch (err) {
      alert(err.response.data.msg || 'Error applying for the job.');
    }
  };

  return (
    <div>
      <h1>Find Your Next Job</h1>
      <div>
        <input
          type="text"
          placeholder="Keywords (e.g., 'React', 'Node.js')"
          name="keywords"
          value={filters.keywords}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="Location (e.g., 'Remote', 'New York')"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
        />
        <select name="jobType" value={filters.jobType} onChange={handleFilterChange}>
          <option value="">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
      </div>
      <hr />
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h3>{job.title}</h3>
                <h4>{job.company.name}</h4>
                <p>{job.location}</p>
                <p><strong>Job Type:</strong> {job.jobType}</p>
                {job.salary && <p><strong>Salary:</strong> ${job.salary.toLocaleString()}</p>}
                <p>{job.description.substring(0, 150)}...</p>
                <button onClick={() => handleApply(job._id)}>Apply Now</button>
              </div>
            ))
          ) : (
            <p>No jobs found matching your criteria. Try broadening your search.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
