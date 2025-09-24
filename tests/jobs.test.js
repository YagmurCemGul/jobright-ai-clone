const request = require('supertest');
const express = require('express');
const axios = require('axios');
const jobsRouter = require('../routes/jobs');

// Mock the axios module
jest.mock('axios');

const app = express();
app.use('/api/jobs', jobsRouter);

describe('Jobs API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 400 error if keywords are not provided', async () => {
    const res = await request(app).get('/api/jobs/search?location=New+York');
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ msg: 'Keywords are required' });
  });

  it('should return 500 if there is an error during scraping', async () => {
    // Mock axios.get to reject with an error
    axios.get.mockRejectedValue(new Error('Network Error'));

    const res = await request(app).get('/api/jobs/search?keywords=developer');
    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe('Server error');
  });

  it('should successfully scrape and return job listings', async () => {
    const mockHtml = `
      <html>
        <body>
          <div class="jobsearch-SerpJobCard">
            <h2 class="jcs-JobTitle"><a href="/job/123">Software Engineer</a></h2>
            <span class="companyName">Tech Corp</span>
            <div class="companyLocation">New York, NY</div>
            <div class="job-snippet">A great job opportunity.</div>
          </div>
          <div class="jobsearch-SerpJobCard">
            <h2 class="jcs-JobTitle"><a href="/job/456">Frontend Developer</a></h2>
            <span class="companyName">Web Inc</span>
            <div class="companyLocation">San Francisco, CA</div>
            <div class="job-snippet">Develop amazing user interfaces.</div>
          </div>
        </body>
      </html>
    `;

    // Mock axios.get to resolve with the mock HTML
    axios.get.mockResolvedValue({ data: mockHtml });

    const res = await request(app).get('/api/jobs/search?keywords=developer&location=USA');

    expect(res.statusCode).toEqual(200);
    expect(axios.get).toHaveBeenCalledWith('https://www.indeed.com/jobs?q=developer&l=USA');
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toEqual({
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'New York, NY',
      summary: 'A great job opportunity.',
      url: 'https://www.indeed.com/job/123',
    });
    expect(res.body[1]).toEqual({
      title: 'Frontend Developer',
      company: 'Web Inc',
      location: 'San Francisco, CA',
      summary: 'Develop amazing user interfaces.',
      url: 'https://www.indeed.com/job/456',
    });
  });
});