const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Extract structured data from document text
 */
async function extractStructuredData(text) {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are a document analysis AI. Always respond with valid JSON only, no markdown, no explanation.'
      },
      {
        role: 'user',
        content: `Analyze this document and return a JSON object with:
- "documentType": detected type (invoice, HR document, report, CSV data, etc.)
- "summary": brief summary
- "extractedFields": key-value pairs of important fields (employee name, invoice amount, GST, vendor, date, etc.)
- "tableData": array of objects if tabular data exists (empty array if none)

Document:
${text.slice(0, 6000)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 2048
  });

  const content = response.choices[0].message.content;
  try {
    // Strip markdown code fences if present
    const clean = content.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { documentType: 'unknown', summary: content, extractedFields: {}, tableData: [] };
  }
}

/**
 * Answer a user question about a document
 */
async function chatWithDocument(question, documentContext, chatHistory = []) {
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant helping users analyze a document.
Document Summary: ${documentContext.summary || ''}
Extracted Fields: ${JSON.stringify(documentContext.extractedFields || {})}
Raw Content: ${(documentContext.rawText || '').slice(0, 4000)}`
    },
    ...chatHistory.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })),
    { role: 'user', content: question }
  ];

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 1024
  });

  return response.choices[0].message.content;
}

/**
 * Extract text from image using vision — Groq doesn't support vision yet,
 * so we return a helpful message and use the raw text path
 */
async function extractFromImage(base64Data, mimeType) {
  // Groq doesn't support image input yet — return placeholder
  return {
    documentType: 'image',
    summary: 'Image uploaded. Please describe what you want to know about this image in the instruction box.',
    extractedFields: {},
    tableData: [],
    rawText: 'Image file — use the chat to ask questions about it.'
  };
}

module.exports = { extractStructuredData, chatWithDocument, extractFromImage };
