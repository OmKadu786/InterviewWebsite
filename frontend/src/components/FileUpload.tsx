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
    <div className="space-y-3">
        {!selectedFile ? (
        <div
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group ${
            isDragging 
                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                : 'border-white/10 bg-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onFileSelect(e.target.files?.[0] || null)} className="hidden" />
          <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${isDragging ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-neutral-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10'}`}>
            <Upload size={24} />
          </div>
          <p className="text-white font-medium mb-1 group-hover:text-emerald-400 transition-colors">Drop resume or click to browse</p>
          <p className="text-xs text-neutral-500">Supported: PDF, JPG, PNG</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 glass-card group hover:border-emerald-500/30">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileText size={24} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-neutral-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }} 
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}