import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if user has already acknowledged
    const consented = localStorage.getItem('privacy-consent');
    if (!consented) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('privacy-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 p-4 md:p-6 animate-fade-in-up">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-green-100 text-green-600 p-2 rounded-full mt-1 shrink-0">
             <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Privacy & Local Processing</h3>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              This website is fully <strong>GDPR compliant</strong>. We do not store or upload your files. 
              All PDF processing (merging, compressing, converting) happens entirely <strong>locally within your web browser</strong>. 
              Your documents never leave your device.
            </p>
          </div>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors w-full md:w-auto whitespace-nowrap shadow-sm"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};