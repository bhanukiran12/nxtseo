require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'nxtseo_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// MongoDB Connection with retry
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected');
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`   Retrying in 3s...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }
  console.error('❌ MongoDB connection failed after all retries');
};
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/backlinks', require('./routes/backlinks'));
app.use('/api/outreach', require('./routes/outreach'));
app.use('/api/gsc', require('./routes/gsc'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NxtSEO Server Running', target: process.env.TARGET_URL });
});

app.listen(PORT, () => {
  console.log(`🚀 NxtSEO Server running on http://localhost:${PORT}`);
  console.log(`🎯 Target URL: ${process.env.TARGET_URL}`);
});

module.exports = app;
