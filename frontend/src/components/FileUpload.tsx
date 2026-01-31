import { Upload, FileText, X, MousePointer2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && (files[0].type === 'application/pdf' || files[0].type === 'image/jpeg' || files[0].type === 'image/png')) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">Resume Upload</label>
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 group ${isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-white/20 hover:border-blue-500/50 hover:bg-white/5 bg-[#161616]'
            }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.png" onChange={(e) => onFileSelect(e.target.files?.[0] || null)} className="hidden" />

          <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
          </div>

          <h3 className="text-lg font-medium text-white mb-1">
            Drop your resume here or click to browse
          </h3>
          <p className="text-sm text-gray-500">
            PDF, JPG, or PNG files
          </p>
        </div>
      ) : (
        <div className="relative border border-blue-500/30 rounded-lg p-6 bg-blue-500/5 flex items-center justify-between group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium mb-0.5">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}