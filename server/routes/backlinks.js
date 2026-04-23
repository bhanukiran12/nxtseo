const express = require('express');
const router = express.Router();
const Backlink = require('../models/Backlink');
const { verifyBacklink } = require('../services/backlinkService');
const cron = require('node-cron');

// Get all backlinks
router.get('/', async (req, res) => {
  try {
    const { status, platform } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const backlinks = await Backlink.find(filter)
      .populate('blogRef', 'title')
      .sort({ createdAt: -1 });

    const stats = {
      total: await Backlink.countDocuments(),
      sent: await Backlink.countDocuments({ status: 'sent' }),
      submitted: await Backlink.countDocuments({ status: 'submitted' }),
      published: await Backlink.countDocuments({ status: 'published' }),
      live: await Backlink.countDocuments({ isLive: true })
    };

    res.json({ backlinks, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify backlink manually
router.post('/:id/verify', async (req, res) => {
  try {
    const result = await verifyBacklink(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily Cron Job for verification (runs at midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('⏳ Running daily backlink verification...');
  const publishedBacklinks = await Backlink.find({ status: 'published', blogUrl: { $exists: true, $ne: '' } });
  for (const bl of publishedBacklinks) {
    await verifyBacklink(bl._id);
  }
  console.log(`✅ Verified ${publishedBacklinks.length} backlinks.`);
});

// Add backlink manually
router.post('/', async (req, res) => {
  try {
    const backlink = new Backlink({
      ...req.body,
      targetLink: req.body.targetLink || 'https://www.ccbp.in/intensive'
    });
    await backlink.save();
    res.json(backlink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update backlink status
router.patch('/:id', async (req, res) => {
  try {
    const backlink = await Backlink.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!backlink) return res.status(404).json({ error: 'Backlink not found' });
    res.json(backlink);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete backlink
router.delete('/:id', async (req, res) => {
  try {
    await Backlink.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
