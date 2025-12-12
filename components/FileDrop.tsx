import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';

interface FileDropProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  description?: string;
}

export const FileDrop: React.FC<FileDropProps> = ({ 
  onFilesSelected, 
  accept = "application/pdf", 
  multiple = false,
  description = "Drag & drop your PDF here, or click to select"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      // Filter by accept type vaguely if needed, but for now trust user or let parent handle validation
      onFilesSelected(droppedFiles);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center
        ${isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept={accept}
        multiple={multiple}
      />
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full ${isDragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
          <UploadCloud size={32} />
        </div>
        <div>
          <p className="text-lg font-medium text-slate-700">{description}</p>
          <p className="text-sm text-slate-500 mt-1">Supports {accept.replace(/\./g, '').toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export const FileList: React.FC<{ files: File[]; onRemove: (index: number) => void }> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      {files.map((file, idx) => (
        <div key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg shrink-0">
              <FileIcon size={20} />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => onRemove(idx)}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};
