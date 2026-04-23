const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Backlink = require('../models/Backlink');
const Outreach = require('../models/Outreach');

router.get('/', async (req, res) => {
  try {
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalBacklinks,
      publishedBacklinks,
      totalOutreach,
      sentOutreach,
      recentBlogs,
      recentBacklinks
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Backlink.countDocuments(),
      Backlink.countDocuments({ status: 'published' }),
      Outreach.countDocuments(),
      Outreach.countDocuments({ status: 'sent' }),
      Blog.find().sort({ createdAt: -1 }).limit(5).select('title status platform createdAt'),
      Backlink.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const platformStats = await Blog.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    const backlinkStatusStats = await Backlink.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalBacklinks,
        publishedBacklinks,
        totalOutreach,
        sentOutreach
      },
      platformStats,
      backlinkStatusStats,
      recentBlogs,
      recentBacklinks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
