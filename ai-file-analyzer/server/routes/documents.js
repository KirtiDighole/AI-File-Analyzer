const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// Get all documents
router.get('/', async (req, res) => {
  const docs = await Document.find({}, 'originalName fileType uploadedAt extractedData.documentType extractedData.summary');
  res.json(docs);
});

// Get single document
router.get('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

// Update extracted fields (editable UI)
router.patch('/:id/fields', async (req, res) => {
  const { extractedFields } = req.body;
  const doc = await Document.findByIdAndUpdate(
    req.params.id,
    { 'extractedData.extractedFields': extractedFields },
    { new: true }
  );
  res.json(doc);
});

// Delete document
router.delete('/:id', async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
