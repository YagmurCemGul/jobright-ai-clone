const axios = require('axios');
const cheerio = require('cheerio');
const Job = require('../models/Job');

const scrapeJobs = async (keywords, location) => {
  const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(
    keywords
  )}&l=${encodeURIComponent(location || '')}`;

  try {
    const { data } = await axios.get(indeedUrl);
    const $ = cheerio.load(data);

    const jobPromises = [];
    $('.jobsearch-SerpJobCard').each((i, el) => {
      const title = $(el).find('.jcs-JobTitle').text().trim();
      const company = $(el).find('.companyName').text().trim();
      const location = $(el).find('.companyLocation').text().trim();
      const summary = $(el).find('.job-snippet').text().trim();
      const partialUrl = $(el).find('.jcs-JobTitle').attr('href');

      if (partialUrl) {
        const url = 'https://www.indeed.com' + partialUrl;
        jobPromises.push(
          (async () => {
            try {
              const { data: jobPageData } = await axios.get(url);
              const $$ = cheerio.load(jobPageData);
              const description = $$('#jobDescriptionText').text().trim();
              const jobData = {
                title,
                company,
                location,
                summary,
                url,
                description: description || summary,
              };

              // Save job to database
              return await Job.findOneAndUpdate({ url: jobData.url }, jobData, {
                new: true,
                upsert: true,
              });
            } catch (err) {
              console.error(`Error fetching job details from ${url}:`, err.message);
              // Return null if fetching fails, to be filtered out later
              return null;
            }
          })()
        );
      }
    });

    const jobs = (await Promise.all(jobPromises)).filter(job => job !== null);
    console.log(`Scraped and saved ${jobs.length} jobs.`);
    return jobs;
  } catch (err) {
    console.error('Error scraping jobs:', err.message);
  }
};

module.exports = { scrapeJobs };