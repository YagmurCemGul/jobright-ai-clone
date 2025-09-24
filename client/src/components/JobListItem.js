import React, { useState } from 'react';
import axios from 'axios';

const JobListItem = ({ job }) => {
  const { _id, title, company, location, summary, url, description } = job;
  const [matchData, setMatchData] = useState(null);
  const [showDescription, setShowDescription] = useState(false);

  const getMatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      const res = await axios.post(`/api/match/${_id}`, null, config);
      setMatchData(res.data);
      setShowDescription(true);
    } catch (err) {
      console.error(err);
    }
  };

  const highlightKeywords = (text, keywords) => {
    if (!keywords || keywords.length === 0) {
      return text;
    }
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? <mark key={index}>{part}</mark> : part
    );
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
      <h3>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>
      <p>
        <strong>{company}</strong> - {location}
      </p>
      <p>{summary}</p>
      <button onClick={getMatch}>Match Me</button>
      {matchData && (
        <div>
          <h4>Match Score: {matchData.score}%</h4>
        </div>
      )}
      {showDescription && (
        <div>
          <h4>Job Description</h4>
          <p>
            {highlightKeywords(description, matchData ? matchData.matchedKeywords : [])}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobListItem;
