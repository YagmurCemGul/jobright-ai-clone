const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');
const User = require('../models/User');
const { extractSkills } = require('../services/skillExtractor');

const upload = multer({ storage: multer.memoryStorage() });

// @route   POST api/resume/upload
// @desc    Upload and parse resume
// @access  Private
router.post('/upload', [auth, upload.single('resume')], async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'Please upload a file' });
  }

  try {
    const dataBuffer = req.file.buffer;
    const data = await pdfParse(dataBuffer);

    const user = await User.findById(req.user.id);
    user.resumeText = data.text;

    // Extract new skills from the resume text
    const extractedSkillNames = await extractSkills(data.text);
    const extractedSkillNamesLower = new Set(extractedSkillNames.map(s => s.toLowerCase()));

    // Get skills that were manually added by the user (we don't want to touch these)
    // A simple heuristic: if a skill has a level other than 'Belirtilmedi', assume it was user-edited.
    const manualSkills = user.skills.filter(skill => skill.level !== 'Belirtilmedi');
    const manualSkillNamesLower = new Set(manualSkills.map(s => s.name.toLowerCase()));

    // Determine the new list of auto-detected skills
    const newAutoSkills = extractedSkillNames
      .filter(name => !manualSkillNamesLower.has(name.toLowerCase()))
      .map(name => ({ name: name, level: 'Belirtilmedi' }));

    // Combine manual skills with the new auto-detected skills
    user.skills = [...manualSkills, ...newAutoSkills];

    await user.save();

    res.json({ msg: 'Resume uploaded, parsed, and skills extracted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
