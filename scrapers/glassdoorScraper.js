const axios = require('axios');
const cheerio = require('cheerio');

const scrapeGlassdoor = async (keywords, location) => {
  const glassdoorUrl = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(
    keywords
  )}&locKeyword=${encodeURIComponent(location || '')}`;

  try {
    const { data } = await axios.get(glassdoorUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
      },
    });

    const $ = cheerio.load(data);
    const jobs = [];

    // NOTE: These selectors are based on Glassdoor's current HTML structure
    // and may break if they update their website.
    $('li.react-job-listing').each((i, el) => {
      const title = $(el).find('a[data-test="job-title"]').text().trim();
      const company = $(el).find('span[data-test="employer-name"]').text().trim();
      const location = $(el).find('div[data-test="location"]').text().trim();
      let url = $(el).find('a[data-test="job-title"]').attr('href');

      if (url && !url.startsWith('https://www.glassdoor.com')) {
        url = 'https://www.glassdoor.com' + url;
      }

      if (title && url && company) {
        jobs.push({
          title,
          company,
          location,
          summary: '', // Summary is not readily available on the list page
          url,
          source: 'Glassdoor',
        });
      }
    });

    if (jobs.length === 0) {
      console.log(
        'Glassdoor scraper found 0 jobs. The site structure might have changed, or the content is loaded via JavaScript.'
      );
    }

    return jobs;
  } catch (err) {
    console.error('Error scraping Glassdoor:', err.message);
    return []; // Return empty array on error to not break the main flow
  }
};

module.exports = scrapeGlassdoor;