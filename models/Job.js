const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  location: {
    type: String,
  },
  summary: {
    type: String,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  source: {
    type: String,
    required: true,
  },
  searchKeywords: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Expire after 24 hours (86400 seconds)
  },
});

module.exports = mongoose.model('Job', JobSchema);