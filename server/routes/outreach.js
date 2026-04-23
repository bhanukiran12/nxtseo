const express = require('express');
const router = express.Router();
const Outreach = require('../models/Outreach');
const { generateOutreachEmail, findRelevantWebsites } = require('../services/aiService');
const { createGmailDraft } = require('../services/gmailService');

// Get all outreach
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const outreach = await Outreach.find(filter).sort({ createdAt: -1 });
    res.json(outreach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Find websites + generate emails (AI)
router.post('/discover', async (req, res) => {
  try {
    const { niche = 'edtech' } = req.body;
    const websites = await findRelevantWebsites(niche);
    res.json({ websites });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate outreach email for a specific website
router.post('/generate-email', async (req, res) => {
  try {
    const { websiteName, websiteUrl, niche } = req.body;
    if (!websiteName || !websiteUrl) {
      return res.status(400).json({ error: 'websiteName and websiteUrl are required' });
    }
    const email = await generateOutreachEmail(websiteName, websiteUrl, niche || 'edtech');
    res.json(email);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save outreach record
router.post('/', async (req, res) => {
  try {
    const outreach = new Outreach(req.body);
    await outreach.save();
    res.json(outreach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Gmail draft
router.post('/:id/draft', async (req, res) => {
  try {
    const tokens = req.session.googleTokens;
    if (!tokens) {
      return res.status(401).json({ error: 'Not connected to Google. Please authenticate first.' });
    }

    const outreach = await Outreach.findById(req.params.id);
    if (!outreach) return res.status(404).json({ error: 'Outreach not found' });
    if (!outreach.contactEmail) {
      return res.status(400).json({ error: 'No contact email for this outreach' });
    }

    const draft = await createGmailDraft(
      tokens,
      outreach.contactEmail,
      outreach.emailSubject,
      outreach.emailBody
    );

    await Outreach.findByIdAndUpdate(req.params.id, {
      gmailDraftId: draft.draftId,
      status: 'draft'
    });

    res.json({ success: true, draftId: draft.draftId });
  } catch (err) {
    console.error('Gmail draft error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update outreach
router.patch('/:id', async (req, res) => {
  try {
    const outreach = await Outreach.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(outreach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete outreach
router.delete('/:id', async (req, res) => {
  try {
    await Outreach.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
