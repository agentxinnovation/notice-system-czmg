// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import your existing routes
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

// Import the cron job
const { startNoticePublisherCronFiveMinutes } = require('./cronJobs/noticePublisher');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the cron job for notice publishing
  startNoticePublisherCronFiveMinutes();
  console.log('Notice publisher cron job initialized');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});