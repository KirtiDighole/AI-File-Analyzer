require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// Connect MongoDB once
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};
connectDB().catch(console.error);

// For local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
