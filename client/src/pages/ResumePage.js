import React, { useState } from 'react';
import api from '../utils/api';

const ResumePage = () => {
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.msg);
    } catch (err) {
      setMessage('Error uploading resume');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>
      {message && <p>{message}</p>}
      <form onSubmit={onSubmit}>
        <div>
          <input type="file" onChange={onChange} />
        </div>
        <input type="submit" value="Upload" />
      </form>
    </div>
  );
};

export default ResumePage;
