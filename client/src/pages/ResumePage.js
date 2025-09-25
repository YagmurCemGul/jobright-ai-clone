import React, { useState } from 'react';
import axios from 'axios';

const ResumePage = () => {
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onUploadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token'), // Assuming you store token in localStorage
        },
      });
      setMessage(res.data.msg);
    } catch (err) {
      setMessage('Error uploading resume');
      console.error(err);
    }
  };

  const onOptimizeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        '/api/resume/optimize',
        { jobDescription },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'), // Assuming you store token in localStorage
          },
        }
      );
      setSuggestions(res.data.suggestions);
      setMessage('');
    } catch (err) {
      setMessage('Error optimizing resume');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>
      {message && <p>{message}</p>}
      <form onSubmit={onUploadSubmit}>
        <div>
          <input type="file" onChange={onFileChange} />
        </div>
        <input type="submit" value="Upload" />
      </form>

      <hr />

      <h1>Optimize Resume</h1>
      <form onSubmit={onOptimizeSubmit}>
        <div>
          <textarea
            rows="10"
            cols="50"
            placeholder="Paste job description here"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
        </div>
        <input type="submit" value="Optimize" />
      </form>

      {suggestions.length > 0 && (
        <div>
          <h2>Keyword Suggestions</h2>
          <ul>
            {suggestions.map((keyword, index) => (
              <li key={index}>{keyword}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResumePage;
