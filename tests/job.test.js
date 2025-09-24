const request = require('supertest');
const express = require('express');
const jobRouter = require('../routes/jobs');
const matchRouter = require('../routes/match');
const authRouter = require('../routes/auth');
const Job = require('../models/Job');
const User = require('../models/User');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobRouter);
app.use('/api/match', matchRouter);
app.use('/api/auth', authRouter);

jest.mock('../middleware/auth');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');

describe('Job and Match API', () => {
  let token;
  let jobId;
  let user;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    user = new User({ name: 'Test User', email: 'test@example.com', password: hashedPassword, resumeText: 'experienced in javascript and nodejs' });
    await user.save();

    const job = new Job({ title: 'Software Developer', company: 'Tech Co', location: 'Remote', description: 'We are looking for a javascript developer', url: 'http://example.com/job/1' });
    const savedJob = await job.save();
    jobId = savedJob._id;

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    token = res.body.token;

    authMiddleware.mockImplementation((req, res, next) => {
      req.user = { id: user.id };
      next();
    });
  });

  it('should search for jobs', async () => {
    const res = await request(app)
      .get('/api/jobs/search?keywords=Software%20Developer')
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should return a match score for a job', async () => {
    const res = await request(app)
      .post(`/api/match/${jobId}`)
      .set('x-auth-token', token);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('matchedKeywords');
    expect(Number(res.body.score)).toBeGreaterThan(0);
  });
});