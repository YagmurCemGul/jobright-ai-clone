const axios = require('axios');
const cheerio = require('cheerio');

const scrapeIndeed = async (keywords, location) => {
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

      if (title && url) {
        jobs.push({
          title,
          company,
          location,
          summary,
          url,
          source: 'Indeed',
        });
      }
    });

    return jobs;
  } catch (err) {
    console.error('Error scraping Indeed:', err.message);
    return []; // Return empty array on error
  }
};

module.exports = scrapeIndeed;