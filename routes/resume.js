const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');
const User = require('../models/User');

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

    await User.findByIdAndUpdate(req.user.id, { resumeText: data.text });

    res.json({ msg: 'Resume uploaded and parsed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
