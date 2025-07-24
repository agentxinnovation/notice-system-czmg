require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);

app.get('/', (req, res) => {
  res.send('🎉 Digital Notice Board API Running');
});

module.exports = app;
