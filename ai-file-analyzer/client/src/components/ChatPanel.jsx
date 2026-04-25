import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const SUGGESTIONS = [
  'What is the total invoice amount?',
  'List all employee names',
  'What is the GST amount?',
  'Summarize this document',
  'What is the vendor name?'
];

export default function ChatPanel({ document: doc, onChatUpdate }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(doc.chatHistory || []);
  const bottomRef = useRef(null);

  useEffect(() => {
    setChatHistory(doc.chatHistory || []);
  }, [doc._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async (q) => {
    const text = q || question.trim();
    if (!text || loading) return;
    setQuestion('');
    setLoading(true);

    const optimistic = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(optimistic);

    try {
      const { data } = await axios.post(`/api/chat/${doc._id}`, { question: text });
      setChatHistory(data.chatHistory);
      onChatUpdate(data.chatHistory);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.response?.data?.error || 'Something went wrong') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-white">Chat with Document</p>
        <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {chatHistory.length === 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-3">Try asking:</p>
            <div className="space-y-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="w-full text-left text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm
              ${msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                  {msg.content}
                </ReactMarkdown>
              ) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about this document..."
            className="flex-1 bg-gray-800 text-sm text-white placeholder-gray-500 rounded-xl px-4 py-2.5 border border-gray-700 focus:border-indigo-500 outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!question.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 transition-colors"
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
