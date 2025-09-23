import React from 'react';

const JobListItem = ({ job }) => {
  const { title, company, location, summary, url } = job;

  return (
    <div style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
      <h3>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>
      <p>{company}</p>
      <p>{location}</p>
      <p>{summary}</p>
    </div>
  );
};

export default JobListItem;
