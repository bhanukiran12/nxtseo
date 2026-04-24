require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
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
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is missing in environment variables!');
    return;
  }

  const isSrv = uri.startsWith('mongodb+srv');
  
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ MongoDB Connected (SRV:', isSrv, ')');
      return;
    } catch (err) {
      console.error(`❌ MongoDB attempt ${i + 1} failed:`, err.message);
      if (err.message.includes('selection timed out')) {
        console.log('   TIP: Check if your IP (0.0.0.0/0) is whitelisted in MongoDB Atlas.');
      }
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

// Serve static files from the React app
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Health check with diagnostics
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'online' : 'offline';
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    services: {
      database: dbStatus,
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      google: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'missing'
    },
    target: process.env.TARGET_URL 
  });
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 NxtSEO Server running on http://localhost:${PORT}`);
  console.log(`🎯 Target URL: ${process.env.TARGET_URL}`);
});

module.exports = app;
