const express = require('express');
const router = express.Router();
const { getAuthUrl, getTokenFromCode, getUserInfo } = require('../services/gmailService');

// Store tokens in session
router.get('/google', (req, res) => {
  const url = getAuthUrl();
  res.json({ authUrl: url });
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const tokens = await getTokenFromCode(code);
    const userInfo = await getUserInfo(tokens);
    req.session.googleTokens = tokens;
    req.session.userInfo = userInfo;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?connected=true&email=${encodeURIComponent(userInfo.email)}`);
  } catch (err) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/settings?error=auth_failed`);
  }
});

router.get('/status', (req, res) => {
  const connected = !!(req.session.googleTokens);
  res.json({
    connected,
    user: req.session.userInfo || null
  });
});

router.post('/logout', (req, res) => {
  req.session.googleTokens = null;
  req.session.userInfo = null;
  res.json({ success: true });
});

module.exports = router;
