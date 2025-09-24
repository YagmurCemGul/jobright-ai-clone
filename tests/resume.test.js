const request = require('supertest');
const express = require('express');
const resumeRouter = require('../routes/resume');

// Mock dependencies with a module factory
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => {
  req.user = { id: 'mockUserId' };
  next();
}));
jest.mock('../models/User', () => ({
  findByIdAndUpdate: jest.fn().mockResolvedValue({ _id: 'mockUserId' }),
}));
jest.mock('pdf-parse', () => jest.fn().mockResolvedValue({ text: 'This is a test resume.' }));

// Now require the modules after mocking
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const pdfParse = require('pdf-parse');

const app = express();
app.use('/api/resume', resumeRouter);

describe('Resume API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upload and parse a resume successfully', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .attach('resume', Buffer.from('dummy pdf content'), 'test.pdf');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ msg: 'Resume uploaded and parsed successfully' });
    expect(authMiddleware).toHaveBeenCalled();
    expect(pdfParse).toHaveBeenCalledWith(Buffer.from('dummy pdf content'));
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('mockUserId', {
      resumeText: 'This is a test resume.',
    });
  });

  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/api/resume/upload');

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ msg: 'Please upload a file' });
    // Ensure mocks that shouldn't be called are not called
    expect(pdfParse).not.toHaveBeenCalled();
    expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('should return 500 if there is a server error during parsing', async () => {
    // Override the mock for this specific test
    pdfParse.mockRejectedValueOnce(new Error('PDF parsing failed'));

    const res = await request(app)
      .post('/api/resume/upload')
      .attach('resume', Buffer.from('dummy pdf content'), 'test.pdf');

    expect(res.statusCode).toEqual(500);
    expect(res.text).toBe('Server error');
  });
});