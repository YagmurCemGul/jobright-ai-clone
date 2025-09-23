const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

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

    $('.jobsearch-SerpJobCard').each((i, el) => {
      const title = $(el).find('.jcs-JobTitle').text().trim();
      const company = $(el).find('.companyName').text().trim();
      const location = $(el).find('.companyLocation').text().trim();
      const summary = $(el).find('.job-snippet').text().trim();
      const url = 'https://www.indeed.com' + $(el).find('.jcs-JobTitle').attr('href');

      jobs.push({ title, company, location, summary, url });
    });

    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
