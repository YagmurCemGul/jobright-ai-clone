import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResumePage = () => {
  const [file, setFile] = useState('');
  const [message, setMessage] = useState('');
  const [groupedSkills, setGroupedSkills] = useState({});
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Belirtilmedi');

  const api = axios.create({
    headers: { 'x-auth-token': localStorage.getItem('token') }
  });

  const fetchSkills = async () => {
    try {
      const res = await api.get('/api/auth');
      setGroupedSkills(res.data.groupedSkills || {});
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const onAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/profile/skills', { name: newSkillName, level: newSkillLevel });
      fetchSkills(); // Refetch to get the updated grouped skills
      setNewSkillName('');
      setNewSkillLevel('Belirtilmedi');
    } catch (err) {
      console.error(err.response ? err.response.data.msg : err.message);
      setMessage(err.response ? err.response.data.msg : 'Error adding skill');
    }
  };

  const onDeleteSkill = async (skillId) => {
    try {
      await api.delete(`/api/profile/skills/${skillId}`);
      fetchSkills(); // Refetch to get the updated grouped skills
    } catch (err) {
      console.error(err);
      setMessage('Error deleting skill');
    }
  };

  const onUpdateSkill = async (skillId, level) => {
    try {
      await api.put(`/api/profile/skills/${skillId}`, { level });
      fetchSkills(); // Refetch to get the updated grouped skills
    } catch (err) {
      console.error(err);
      setMessage('Error updating skill');
    }
  };

  const onChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await axios.post('/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': localStorage.getItem('token'),
        },
      });
      setMessage(res.data.msg);
      fetchSkills(); // Refetch skills after upload
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
      <div className="skills-section">
        <h2>My Skills</h2>

        {/* Add New Skill Form */}
        <form onSubmit={onAddSkill} className="add-skill-form">
          <input
            type="text"
            placeholder="Add a new skill"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            required
          />
          <select value={newSkillLevel} onChange={(e) => setNewSkillLevel(e.target.value)}>
            <option value="Belirtilmedi">Select Level</option>
            <option value="Başlangıç">Başlangıç</option>
            <option value="Orta">Orta</option>
            <option value="İleri">İleri</option>
            <option value="Uzman">Uzman</option>
          </select>
          <button type="submit">Add Skill</button>
        </form>

        {/* Display Skills */}
        {Object.keys(groupedSkills).length > 0 ? (
          Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="skill-category">
              <h3>{category}</h3>
              <ul className="skills-list">
                {skills.map((skill) => (
                  <li key={skill._id} className="skill-item">
                    <span className="skill-name">{skill.name}</span>
                    <div className="skill-controls">
                      <select
                        value={skill.level}
                        onChange={(e) => onUpdateSkill(skill._id, e.target.value)}
                      >
                        <option value="Belirtilmedi">Select Level</option>
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri">İleri</option>
                        <option value="Uzman">Uzman</option>
                      </select>
                      <button onClick={() => onDeleteSkill(skill._id)} className="delete-btn">X</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No skills found. Upload your resume or add them manually.</p>
        )}
      </div>
    </div>
  );
};

export default ResumePage;
