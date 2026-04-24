const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Blog = require('../models/Blog');
const Backlink = require('../models/Backlink');
const { generateBlog } = require('../services/aiService');
const {
  formatForMedium, formatForLinkedIn, formatForDevTo, formatForHashnode,
  publishToDevTo, publishToHashnode
} = require('../services/platformService');

// Generate blog with AI
router.post('/generate', async (req, res) => {
  console.log(`[BLOGS] POST /generate called with topic: ${req.body?.topic}`);
  try {
    const { topic, keywords, tone } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const aiResult = await generateBlog(topic, keywords || [], tone || 'professional');

    // Prepare formatted versions
    const blogData = {
      ...aiResult,
      topic,
      status: 'draft',
      formattedVersions: {}
    };

    // Save to DB
    const blog = new Blog(blogData);

    // Generate formatted versions
    blog.formattedVersions = {
      medium: formatForMedium(blog),
      linkedin: formatForLinkedIn(blog),
      devto: formatForDevTo(blog),
      hashnode: JSON.stringify(formatForHashnode(blog), null, 2)
    };

    await blog.save();

    // Auto-create backlink records for each backlink in the blog
    if (aiResult.backlinks && aiResult.backlinks.length > 0) {
      const backlinkDocs = aiResult.backlinks.map(bl => ({
        platform: 'pending',
        blogTitle: aiResult.title,
        targetLink: bl.url,
        anchorText: bl.anchorText,
        status: 'sent',
        blogRef: blog._id
      }));
      await Backlink.insertMany(backlinkDocs);
    }

    res.json({ success: true, blog });
  } catch (err) {
    console.error('Blog generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const { status, platform, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform;

    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Blog.countDocuments(filter);
    res.json({ blogs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  console.log(`[BLOGS] GET /:id called with ID: ${req.params.id}`);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid Blog ID format' });
    }
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update blog
router.patch('/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Publish to platform
router.post('/:id/publish', async (req, res) => {
  try {
    const { platform, apiKey, publicationId } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: 'Blog not found' });

    let result;

    if (platform === 'devto') {
      result = await publishToDevTo(blog, apiKey);
      await Blog.findByIdAndUpdate(req.params.id, {
        platform: 'devto',
        status: 'published',
        publishedUrl: result.url,
        devtoId: result.id
      });
    } else if (platform === 'hashnode') {
      result = await publishToHashnode(blog, apiKey, publicationId);
      await Blog.findByIdAndUpdate(req.params.id, {
        platform: 'hashnode',
        status: 'published',
        publishedUrl: result.url,
        hashnodeId: result.id
      });
    } else {
      // Medium/LinkedIn: mark as exported
      await Blog.findByIdAndUpdate(req.params.id, {
        platform,
        status: 'exported'
      });
      result = { success: true, message: 'Blog marked as exported for ' + platform };
    }

    // Update backlinks with platform name
    await Backlink.updateMany({ blogRef: blog._id }, { platform });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete blog
router.delete('/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
