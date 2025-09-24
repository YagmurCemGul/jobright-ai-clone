const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const db = process.env.MONGO_URI || 'mongodb://localhost:27017/test';
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
  }
};

module.exports = connectDB;
