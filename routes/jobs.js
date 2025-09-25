const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const scrapeIndeed = require('../scrapers/indeedScraper');
const scrapeGlassdoor = require('../scrapers/glassdoorScraper');

// @route   GET api/jobs/search
// @desc    Search for jobs by scraping sources or retrieving from cache
// @access  Private
router.get('/search', async (req, res) => {
  const { keywords, location } = req.query;

  if (!keywords) {
    return res.status(400).json({ msg: 'Keywords are required' });
  }

  const searchKeywords = [keywords.toLowerCase()];

  try {
    // Check for cached results
    const cachedJobs = await Job.find({
      searchKeywords: { $in: searchKeywords },
    });

    if (cachedJobs.length > 0) {
      console.log('Returning cached results');
      return res.json(cachedJobs);
    }

    // If no cached results, scrape sources in parallel
    console.log('No cached results found, scraping sources...');
    const [indeedJobs, glassdoorJobs] = await Promise.all([
      scrapeIndeed(keywords, location),
      scrapeGlassdoor(keywords, location),
    ]);

    const combinedJobs = [...indeedJobs, ...glassdoorJobs];

    // Deduplicate results based on URL
    const uniqueJobs = Array.from(new Map(combinedJobs.map((job) => [job.url, job])).values());

    const jobsToSave = uniqueJobs.map((job) => ({
      ...job,
      searchKeywords,
    }));

    if (jobsToSave.length > 0) {
      // Use insertMany for efficiency, ignoring duplicate errors
      await Job.insertMany(jobsToSave, { ordered: false }).catch((err) => {
        if (err.code !== 11000) {
          throw err;
        }
      });
    }

    res.json(jobsToSave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
