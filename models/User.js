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
  skills: [{
    name: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['Başlangıç', 'Orta', 'İleri', 'Uzman', 'Belirtilmedi'],
      default: 'Belirtilmedi'
    }
  }],
});

module.exports = User = mongoose.model('user', UserSchema);
