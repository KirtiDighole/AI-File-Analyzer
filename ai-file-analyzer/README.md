# AI File Analyzer

AI-powered document analysis chatbot using React, Node.js, Gemini API, and MongoDB.

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
# Add your GEMINI_API_KEY and MONGODB_URI to .env
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm start
```

## Features
- Upload PDF, CSV, and Image files (drag & drop)
- Gemini AI extracts structured data (invoice fields, employee details, etc.)
- Editable extracted fields UI
- Chat interface to ask questions about the document
- MongoDB stores documents and chat history
