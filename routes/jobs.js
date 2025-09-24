const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const { findMatchedJobs } = require('../services/matchingService');
const axios = require('axios');
const cheerio = require('cheerio');

// @route   GET api/jobs/matched
// @desc    Get matched jobs for the current user
// @access  Private
router.get('/matched', auth, async (req, res) => {
  try {
    const matchedJobs = await findMatchedJobs(req.user.id);
    res.json(matchedJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs
// @desc    Create a new job posting (for testing/admin purposes)
// @access  Private (should be restricted to admins in a real app)
router.post('/', auth, async (req, res) => {
  const { title, company, description, skills } = req.body;
  try {
    const newJob = new Job({
      title,
      company,
      description,
      skills
    });
    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/jobs/search
// @desc    Search for jobs by scraping Indeed
// @access  Private
// @note    This is for demonstration purposes only and is not robust.
//          The scraper will break if Indeed changes its HTML structure.
router.get('/search', async (req, res) => {
  const { keywords, location } = req.query;

  if (!keywords) {
    return res.status(400).json({ msg: 'Keywords are required' });
  }

  const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
    keywords
  )}&l=${encodeURIComponent(location || '')}`;

  try {
    const { data } = await axios.get(indeedUrl);
    const $ = cheerio.load(data);
    const jobs = [];

    const jobPromises = [];
    $('.jobsearch-SerpJobCard').each((i, el) => {
      const title = $(el).find('.jcs-JobTitle').text().trim();
      const company = $(el).find('.companyName').text().trim();
      const location = $(el).find('.companyLocation').text().trim();
      const summary = $(el).find('.job-snippet').text().trim();
      const url = 'https://www.indeed.com' + $(el).find('.jcs-JobTitle').attr('href');

      // A simple way to extract potential skills from summary
      const potentialSkills = summary.split(' ').filter(word => word.length > 2 && (word.toLowerCase().includes('js') || ['react', 'node', 'python', 'java', 'sql', 'aws', 'docker'].includes(word.toLowerCase())));

      const jobData = { title, company, location, description: summary, url, skills: [...new Set(potentialSkills)] };

      // Upsert job into DB: update if it exists (based on title and company), otherwise insert.
      // This prevents duplicate jobs from the same scrape.
      const promise = Job.findOneAndUpdate(
        { title: jobData.title, company: jobData.company },
        jobData,
        { upsert: true, new: true }
      );
      jobPromises.push(promise);
    });

    const savedJobs = await Promise.all(jobPromises);
    res.json(savedJobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
