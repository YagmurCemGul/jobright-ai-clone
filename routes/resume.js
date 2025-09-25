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

// @route   POST api/resume/optimize
// @desc    Optimize resume based on job description
// @access  Private
router.post('/optimize', auth, async (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ msg: 'Please provide a job description' });
  }

  try {
    const user = await User.findById(req.user.id);
    const resumeText = user.resumeText;

    if (!resumeText) {
      return res.status(400).json({ msg: 'Please upload a resume first' });
    }

    // Keyword extraction with stop word filtering
    const extractKeywords = (text) => {
      const stopWords = new Set([
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
        'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her',
        'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
        'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
        'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if',
        'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with',
        'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after',
        'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over',
        'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
        'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
        'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
        'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
      ]);

      return text
        .toLowerCase()
        .replace(/[^\w\s]/gi, '') // Remove punctuation
        .split(/\s+/) // Split into words
        .filter((word) => word.length > 2 && !stopWords.has(word)); // Filter out short words and stop words
    };

    const resumeKeywords = new Set(extractKeywords(resumeText));
    const jobKeywords = new Set(extractKeywords(jobDescription));

    const missingKeywords = [...jobKeywords].filter(
      (keyword) => !resumeKeywords.has(keyword)
    );

    res.json({ suggestions: missingKeywords });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
