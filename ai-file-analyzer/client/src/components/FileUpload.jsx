import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onUpload, loading }) {
  const [preview, setPreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    onDrop: (files) => {
      const file = files[0];
      if (!file) return;
      setPreview({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
      onUpload(file);
    }
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-indigo-400 bg-indigo-900/30' : 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50'}`}
      >
        <input {...getInputProps()} />
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm text-gray-300">
          {isDragActive ? 'Drop it here...' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF, CSV, JPG, PNG</p>
      </div>

      {loading && (
        <div className="mt-3 flex items-center gap-2 text-indigo-400 text-sm">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Analyzing with Gemini...
        </div>
      )}

      {preview && !loading && (
        <div className="mt-3 bg-gray-800 rounded-lg p-3 text-xs text-gray-300">
          <span className="text-green-400">✓</span> {preview.name} ({preview.size})
        </div>
      )}
    </div>
  );
}
