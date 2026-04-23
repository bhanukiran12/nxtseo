const mongoose = require('mongoose');

const backlinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  blogUrl: { type: String },
  blogTitle: { type: String },
  targetLink: { type: String, default: 'https://www.ccbp.in/intensive' },
  anchorText: { type: String, required: true },
  status: { type: String, enum: ['sent', 'submitted', 'published'], default: 'sent' },
  notes: { type: String },
  domainAuthority: { type: Number },
  blogRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }
}, { timestamps: true });

module.exports = mongoose.model('Backlink', backlinkSchema);
