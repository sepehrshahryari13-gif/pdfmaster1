import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start justify-between mb-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-start gap-3">
        <div className="bg-red-100 p-1.5 rounded-full text-red-600 shrink-0 mt-0.5">
           <AlertCircle size={16} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-red-900">Something went wrong</h4>
          <p className="text-sm text-red-700 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <button 
        onClick={onDismiss} 
        className="text-red-400 hover:text-red-600 hover:bg-red-100 p-1 rounded-lg transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};