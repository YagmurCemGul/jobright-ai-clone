import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ApplicantsPage = () => {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      setLoading(true);
      try {
        const [jobRes, applicantsRes] = await Promise.all([
          axios.get(`/api/jobs/${id}`),
          axios.get(`/api/jobs/${id}/applicants`),
        ]);
        setJobTitle(jobRes.data.title);
        setApplicants(applicantsRes.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchJobAndApplicants();
  }, [id]);

  return (
    <div>
      <h1>Applicants for "{jobTitle}"</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {applicants.length > 0 ? (
            applicants.map((applicant) => (
              <div key={applicant.user._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                <h4>{applicant.user.name}</h4>
                <p><strong>Email:</strong> {applicant.user.email}</p>
                <p><strong>Applied on:</strong> {new Date(applicant.date).toLocaleDateString()}</p>
                <hr />
                <p><strong>Resume:</strong></p>
                <p>{applicant.resumeText}</p>
              </div>
            ))
          ) : (
            <p>No applicants have applied for this job yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicantsPage;