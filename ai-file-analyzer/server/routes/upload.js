const express = require('express');
const multer = require('multer');
const router = express.Router();
const Document = require('../models/Document');
const { extractStructuredData, extractFromImage } = require('../utils/gemini');
const { parsePDF, parseCSV } = require('../utils/fileParser');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/csv', 'image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let rawText = '';
    let extractedData = {};
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      rawText = await parsePDF(file.buffer);
      extractedData = await extractStructuredData(rawText, 'pdf');
    } else if (mimeType === 'text/csv') {
      rawText = await parseCSV(file.buffer);
      extractedData = await extractStructuredData(rawText, 'csv');
    } else if (mimeType.startsWith('image/')) {
      const base64 = file.buffer.toString('base64');
      extractedData = await extractFromImage(base64, mimeType);
      rawText = extractedData.rawText || '';
    }

    const doc = await Document.create({
      filename: `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      fileType: mimeType.startsWith('image/') ? 'image' : mimeType === 'text/csv' ? 'csv' : 'pdf',
      extractedData,
      rawText
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
