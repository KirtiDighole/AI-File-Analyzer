const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { chatWithDocument } = require('../utils/gemini');

router.post('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { question } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const answer = await chatWithDocument(
      question,
      {
        summary: doc.extractedData?.summary,
        extractedFields: doc.extractedData?.extractedFields,
        rawText: doc.rawText
      },
      doc.chatHistory
    );

    doc.chatHistory.push({ role: 'user', content: question });
    doc.chatHistory.push({ role: 'assistant', content: answer });
    await doc.save();

    res.json({ answer, chatHistory: doc.chatHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
