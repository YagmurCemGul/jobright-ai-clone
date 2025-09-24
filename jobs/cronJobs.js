const cron = require('node-cron');
const { scrapeJobs } = require('../services/scraperService');

const initCronJobs = () => {
  // Schedule a job to run every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running a job every hour to scrape for new job postings');
    scrapeJobs('software developer', 'United States');
  });
};

module.exports = { initCronJobs };