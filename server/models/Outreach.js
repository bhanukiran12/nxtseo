const mongoose = require('mongoose');

const outreachSchema = new mongoose.Schema({
  websiteName: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  contactEmail: { type: String },
  niche: { type: String },
  emailSubject: { type: String },
  emailBody: { type: String },
  status: { type: String, enum: ['draft', 'sent', 'replied', 'rejected'], default: 'draft' },
  gmailDraftId: { type: String },
  sentAt: { type: Date },
  repliedAt: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Outreach', outreachSchema);
