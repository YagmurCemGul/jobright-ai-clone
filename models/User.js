const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  resumeText: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['job_seeker', 'employer'],
    default: 'job_seeker',
  },
});

module.exports = User = mongoose.model('user', UserSchema);
