import { Upload, FileText, X } from 'lucide-react';
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
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (files.length > 0 && validTypes.includes(files[0].type)) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">Resume Upload</label>
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? 'border-indigo-400 bg-indigo-950/50' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onFileSelect(e.target.files?.[0] || null)} className="hidden" />
          <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
          <p className="text-slate-300 font-medium mb-1">Drop your resume here or click to browse</p>
          <p className="text-sm text-slate-500">PDF, JPG, or PNG files</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-indigo-400" />
            <div>
              <p className="text-slate-200 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button onClick={() => onFileSelect(null)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
          </button>
        </div>
      )}
    </div>
  );
}