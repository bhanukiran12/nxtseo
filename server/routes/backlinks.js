const express = require('express');
const router = express.Router();
const Backlink = require('../models/Backlink');

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
      published: await Backlink.countDocuments({ status: 'published' })
    };

    res.json({ backlinks, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
