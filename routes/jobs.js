const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const Notification = require('../models/Notification');

// @route   POST api/jobs
// @desc    Create a job posting
// @access  Private (Employer)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ msg: 'Access denied' });
  }

  const { title, description, location, jobType, salary } = req.body;

  try {
    const company = await Company.findOne({ user: req.user.id });
    if (!company) {
      return res.status(404).json({ msg: 'Employer company profile not found' });
    }

    const newJob = new Job({
      title,
      description,
      location,
      jobType,
      salary,
      company: company.id,
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs
// @desc    Get all jobs with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { keywords, location, jobType } = req.query;
    const query = {};

    if (keywords) {
      query.$or = [
        { title: { $regex: keywords, $options: 'i' } },
        { description: { $regex: keywords, $options: 'i' } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query).populate('company', ['name', 'website']);
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/:id
// @desc    Get a single job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', ['name', 'website']);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Job not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Job Seeker)
router.post('/:id/apply', auth, async (req, res) => {
  if (req.user.role !== 'job_seeker') {
    return res.status(403).json({ msg: 'Only job seekers can apply' });
  }

  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    const user = await User.findById(req.user.id);
    if (job.applicants.some(app => app.user.equals(req.user.id))) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    job.applicants.unshift({ user: req.user.id, resumeText: user.resumeText });
    await job.save();

    // Create a notification for the employer
    const company = await Company.findById(job.company);
    if (company) {
      const notification = new Notification({
        user: company.user,
        message: `${user.name} applied for your job posting: ${job.title}`,
        link: `/jobs/${job.id}/applicants`,
      });
      await notification.save();
    }

    res.json(job.applicants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/jobs/:id/applicants
// @desc    Get applicants for a job
// @access  Private (Employer)
router.get('/:id/applicants', auth, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const job = await Job.findById(req.params.id).populate('applicants.user', ['name', 'email']);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }
        const company = await Company.findOne({ user: req.user.id });
        if (job.company.toString() !== company.id.toString()) {
            return res.status(401).json({ msg: 'Not authorized to view these applicants' });
        }
        res.json(job.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/jobs/my-jobs
// @desc    Get all jobs for the logged in employer
// @access  Private (Employer)
router.get('/my-jobs', auth, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.status(403).json({ msg: 'Access denied' });
    }
    try {
        const company = await Company.findOne({ user: req.user.id });
        if (!company) {
            return res.status(404).json({ msg: 'Employer company profile not found' });
        }
        const jobs = await Job.find({ company: company.id });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;