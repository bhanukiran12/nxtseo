const mongoose = require('mongoose');

const backlinkSchema = new mongoose.Schema({
  url: String,
  anchorText: String
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  keywords: [String],
  topic: { type: String },
  backlinks: [backlinkSchema],
  platform: { type: String, enum: ['medium', 'linkedin', 'devto', 'hashnode', 'none'], default: 'none' },
  status: { type: String, enum: ['draft', 'exported', 'published'], default: 'draft' },
  publishedUrl: { type: String },
  wordCount: { type: Number },
  readTime: { type: Number },
  devtoId: { type: String },
  hashnodeId: { type: String },
  formattedVersions: {
    medium: { type: String },
    linkedin: { type: String },
    devto: { type: String },
    hashnode: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
