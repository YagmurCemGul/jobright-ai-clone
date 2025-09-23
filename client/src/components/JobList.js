import React from 'react';
import JobListItem from './JobListItem';

const JobList = ({ jobs }) => {
  return (
    <div>
      {jobs.map((job, index) => (
        <JobListItem key={index} job={job} />
      ))}
    </div>
  );
};

export default JobList;
