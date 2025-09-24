const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// @route   GET api/jobs/search
// @desc    Search for jobs from the database
// @access  Private
router.get('/search', async (req, res) => {
  const { keywords, location } = req.query;

  try {
    const query = {};
    if (keywords) {
      query.title = new RegExp(keywords, 'i');
    }
    if (location) {
      query.location = new RegExp(location, 'i');
    }

    const jobs = await Job.find(query).sort({ date: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
