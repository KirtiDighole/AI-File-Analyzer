import React from 'react';

const typeIcon = { pdf: '📄', csv: '📊', image: '🖼️' };

export default function DocumentList({ documents, selectedId, onSelect, onDelete }) {
  if (!documents.length) {
    return <p className="text-gray-600 text-xs text-center px-4 py-6">No documents yet</p>;
  }

  return (
    <div className="px-3 pb-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-1">Documents</p>
      {documents.map(doc => (
        <div
          key={doc._id}
          onClick={() => onSelect(doc)}
          className={`group flex items-start gap-2 p-3 rounded-lg cursor-pointer mb-1 transition-all
            ${selectedId === doc._id ? 'bg-indigo-900/50 border border-indigo-700' : 'hover:bg-gray-800'}`}
        >
          <span className="text-lg mt-0.5">{typeIcon[doc.fileType] || '📄'}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-200 truncate">{doc.originalName}</p>
            <p className="text-xs text-gray-500 truncate">{doc.extractedData?.documentType || 'Processing...'}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc._id); }}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 text-xs transition-opacity"
            aria-label="Delete document"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
