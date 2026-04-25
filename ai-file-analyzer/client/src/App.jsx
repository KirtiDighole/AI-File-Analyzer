import React, { useState } from 'react';
import axios from './api';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [file, setFile] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDocId, setCurrentDocId] = useState(null);

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    onDrop: (files) => files[0] && setFile(files[0]),
  });

  const handleAnalyze = async () => {
    if (!file || !instruction.trim()) return;
    setLoading(true);

    try {
      let docId = currentDocId;

      // Upload file if new
      if (!docId) {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axios.post('/api/upload', formData);
        docId = data.document._id;
        setCurrentDocId(docId);
      }

      // Add user message to history
      const userMsg = { role: 'user', file: file.name, content: instruction };
      setChatHistory(prev => [...prev, userMsg]);
      setInstruction('');

      // Chat
      const { data: chatData } = await axios.post(`/api/chat/${docId}`, { question: instruction });
      setChatHistory(chatData.chatHistory);
    } catch (err) {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.error || 'Something went wrong'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setCurrentDocId(null);
    setFile(null);
    setInstruction('');
  };

  const removeFile = () => {
    setFile(null);
    setCurrentDocId(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      {/* Top bar */}
      <div className="flex justify-end items-center px-6 py-3 gap-4">
        <span className="text-sm text-gray-400 cursor-pointer hover:text-white">Fork</span>
        <svg className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span className="text-gray-400 cursor-pointer hover:text-white text-xl">⋮</span>
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">AI File Analyzer</h1>

        {/* Clear Chat */}
        <button
          onClick={handleClearChat}
          className="mb-6 px-4 py-1.5 border border-gray-600 text-sm text-gray-300 rounded hover:bg-gray-800 transition-colors"
        >
          Clear Chat
        </button>

        {/* Upload area */}
        <p className="text-sm text-gray-400 mb-2">Upload a file</p>
        <div
          {...getRootProps()}
          className="flex items-center justify-between border border-gray-700 rounded-lg px-4 py-4 bg-[#1a1a1a] mb-3"
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-3">
            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-sm text-gray-200">Drag and drop file here</p>
              <p className="text-xs text-gray-500">Limit 200MB per file • CSV, XLS, PDF, JPG, PNG, JPEG</p>
            </div>
          </div>
          <button
            onClick={open}
            className="px-4 py-2 border border-gray-600 text-sm text-gray-300 rounded hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Browse files
          </button>
        </div>

        {/* File preview */}
        {file && (
          <div className="flex items-center justify-between border border-gray-700 rounded-lg px-4 py-3 bg-[#1a1a1a] mb-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-200">{file.name}</span>
              <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(1)}MB</span>
            </div>
            <button onClick={removeFile} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
          </div>
        )}

        {/* Instruction input */}
        <p className="text-sm text-gray-400 mb-2">Enter your instruction</p>
        <textarea
          value={instruction}
          onChange={e => setInstruction(e.target.value)}
          placeholder="e.g. What is the total invoice amount?"
          rows={4}
          className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-gray-500 resize-none mb-4"
        />

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || !instruction.trim() || loading}
          className="px-5 py-2 border border-gray-600 text-sm text-gray-200 rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Chat History</h2>
            <div className="space-y-3">
              {chatHistory.map((msg, i) => (
                <div key={i} className="border border-gray-800 rounded-lg bg-[#1a1a1a] overflow-hidden">
                  {/* Role header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
                    {msg.role === 'user' ? (
                      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-xs font-bold">U</div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">AI</div>
                    )}
                    <span className="text-sm text-gray-300">
                      {msg.role === 'user'
                        ? (msg.file ? `File: ${msg.file}` : 'You')
                        : 'Assistant'}
                    </span>
                  </div>
                  {/* Message content */}
                  <div className="px-4 py-3 text-sm text-gray-300 leading-relaxed">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="border border-gray-800 rounded-lg bg-[#1a1a1a] px-4 py-4 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">AI</div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
