import React, { useState } from 'react';

export default function DocumentViewer({ document: doc, onFieldUpdate }) {
  const [fields, setFields] = useState(doc.extractedData?.extractedFields || {});
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onFieldUpdate(fields);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const tableData = doc.extractedData?.tableData || [];

  return (
    <div className="max-w-3xl">
      {/* Document header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">{doc.originalName}</h2>
        <div className="flex gap-3 mt-2">
          <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full">
            {doc.extractedData?.documentType || 'Unknown'}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(doc.uploadedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Summary */}
      {doc.extractedData?.summary && (
        <div className="bg-gray-800/60 rounded-xl p-4 mb-5 border border-gray-700">
          <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Summary</p>
          <p className="text-sm text-gray-300 leading-relaxed">{doc.extractedData.summary}</p>
        </div>
      )}

      {/* Extracted Fields - Editable */}
      {Object.keys(fields).length > 0 && (
        <div className="bg-gray-800/60 rounded-xl p-4 mb-5 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-indigo-400 uppercase tracking-wider">Extracted Fields</p>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-colors">
                    Save
                  </button>
                  <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded-lg transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg transition-colors">
                  ✏️ Edit
                </button>
              )}
              {saved && <span className="text-xs text-green-400">Saved ✓</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                {editing ? (
                  <input
                    value={value}
                    onChange={e => setFields(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-gray-800 text-sm text-white rounded px-2 py-1 border border-gray-600 focus:border-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-sm text-gray-200">{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Data */}
      {tableData.length > 0 && (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 overflow-x-auto">
          <p className="text-xs text-indigo-400 uppercase tracking-wider mb-3">Table Data</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                {Object.keys(tableData[0]).map(col => (
                  <th key={col} className="text-left text-xs text-gray-400 pb-2 pr-4 capitalize">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="py-2 pr-4 text-gray-300">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
