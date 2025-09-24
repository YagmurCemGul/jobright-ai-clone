const express = require('express');
const connectDB = require('./config/db');
const { initCronJobs } = require('./jobs/cronJobs');

const app = express();

// Connect Database
connectDB();

// Initialize Cron Jobs
initCronJobs();

// Init Middleware
app.use(express.json());

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/match', require('./routes/match'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
