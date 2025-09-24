const request = require('supertest');
const express = require('express');
const jobsRouter = require('./jobs');

const app = express();
app.use('/api/jobs', jobsRouter);

jest.mock('axios');
const axios = require('axios');

describe('GET /api/jobs/search', () => {
  it('should return a 200 OK status and job listings', async () => {
    const mockHtml = `
      <html>
        <body>
          <div id="searchCount-header">Page 1 of 1,234 jobs</div>
          <div class="jobsearch-SerpJobCard">
            <h2 class="title"><a class="jcs-JobTitle" href="/job/123"><span>Software Engineer</span></a></h2>
            <div class="companyName">Tech Corp</div>
            <div class="companyLocation">San Francisco, CA</div>
            <div class="job-snippet">A great job.</div>
          </div>
        </body>
      </html>
    `;
    axios.get.mockResolvedValue({ data: mockHtml });

    const res = await request(app)
      .get('/api/jobs/search?keywords=react&location=usa')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body).toHaveProperty('jobs');
    expect(res.body.jobs.length).toBe(1);
    expect(res.body.jobs[0].title).toBe('Software Engineer');
  });

  it('should return a 400 Bad Request if keywords are missing', async () => {
    const res = await request(app)
      .get('/api/jobs/search?location=usa')
      .expect(400);

    expect(res.body.msg).toBe('Keywords are required');
  });
});