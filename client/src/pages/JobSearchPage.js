import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobList from '../components/JobList';

const JobSearchPage = () => {
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
  });
  const [jobs, setJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('matched'); // 'matched' or 'search'

  const api = axios.create({
    headers: { 'x-auth-token': localStorage.getItem('token') }
  });

  useEffect(() => {
    const fetchMatchedJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/jobs/matched');
        setMatchedJobs(res.data);
      } catch (err) {
        console.error("Error fetching matched jobs:", err);
      }
      setLoading(false);
    };
    fetchMatchedJobs();
  }, []);


  const { keywords, location } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setView('search');
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
    <div className="job-search-page">
      <div className="search-container">
        <h1>Find Your Next Job</h1>
        <form onSubmit={onSubmit} className="search-form">
          <input
            type="text"
            placeholder="Job title, keywords..."
            name="keywords"
            value={keywords}
            onChange={onChange}
            required
          />
          <input
            type="text"
            placeholder="City, state, or zip code"
            name="location"
            value={location}
            onChange={onChange}
          />
          <button type="submit">Search Jobs</button>
        </form>
      </div>

      <div className="results-container">
        <div className="view-toggle">
          <button onClick={() => setView('matched')} className={view === 'matched' ? 'active' : ''}>
            Matched for You
          </button>
          <button onClick={() => setView('search')} className={view === 'search' ? 'active' : ''}>
            Search Results
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {view === 'matched' && (
              <div>
                <h2>Jobs Matched to Your Skills</h2>
                <JobList jobs={matchedJobs} />
              </div>
            )}
            {view === 'search' && (
              <div>
                <h2>Search Results</h2>
                <JobList jobs={jobs} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JobSearchPage;
