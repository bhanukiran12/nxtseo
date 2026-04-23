const express = require('express');
const router = express.Router();
const { getSearchConsoleData, getSiteList } = require('../services/gscService');

router.get('/performance', async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not connected to Google Search Console' });
    }
    const days = parseInt(req.query.days) || 28;
    const data = await getSearchConsoleData(tokens, days);
    res.json(data);
  } catch (err) {
    console.error('GSC error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/sites', async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens) return res.status(401).json({ error: 'Not connected' });
    const sites = await getSiteList(tokens);
    res.json({ sites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
