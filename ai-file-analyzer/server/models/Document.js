const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  fileType: String, // 'pdf', 'csv', 'image'
  extractedData: mongoose.Schema.Types.Mixed, // structured data from Gemini
  rawText: String,
  uploadedAt: { type: Date, default: Date.now },
  chatHistory: [
    {
      role: { type: String, enum: ['user', 'assistant'] },
      content: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Document', DocumentSchema);
