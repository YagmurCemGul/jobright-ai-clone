import React from 'react';

const JobListItem = ({ job }) => {
  // Destructure properties from the job object
  // The 'url' and 'summary' might come from scraped data,
  // while 'description' and 'skills' come from our database.
  const { title, company, location, summary, url, description, matchDetails } = job;

  return (
    <div className="job-list-item">
      {matchDetails && (
        <div className="match-details">
          <strong>Match Score: {matchDetails.score}%</strong>
        </div>
      )}
      <div className="job-header">
        <h3>
          <a href={url || '#'} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h3>
        <p className="company-name">{company}</p>
        <p className="location">{location}</p>
      </div>
      <div className="job-body">
        <p>{summary || description}</p>
      </div>
      {matchDetails && matchDetails.matchedCategories && matchDetails.matchedCategories.size > 0 && (
        <div className="matched-categories">
          <strong>Matched Categories:</strong>
          <div className="skills-tags">
            {Array.from(matchDetails.matchedCategories).map((category, index) => (
              <span key={index} className="skill-tag category-tag">{category}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListItem;
