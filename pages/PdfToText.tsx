import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { extractTextFromPdf, downloadBlob } from '../services/pdfService';
import { FileText, Download, Loader2, RefreshCw, Copy } from 'lucide-react';

const PdfToText: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      setText('');
      setProgress(0);
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setText('');
    setProgress(0);
    setErrorMessage(null);
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    try {
      const result = await extractTextFromPdf(file, (p) => setProgress(p));
      if (!result || result.trim().length === 0) {
          setErrorMessage("No text found. The PDF might be a scanned image without OCR layer.");
      } else {
          setText(result);
      }
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('Password')) {
        setErrorMessage("The PDF is password protected. Please unlock it first.");
      } else {
        setErrorMessage("Failed to extract text. The file might be corrupted.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (text && file) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const name = file.name.replace(/\.pdf$/i, '');
      downloadBlob(blob, `${name}.txt`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // Could use a toast here, but native alert is okay for success confirmation
    // or we can just change button state briefly.
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 h-full flex flex-col">
      <div className="text-center space-y-2 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">PDF to Text</h1>
        <p className="text-slate-500">Extract plain text from your PDF documents.</p>
      </div>

      <div className="flex-1 min-h-0 grid md:grid-cols-3 gap-6">
        {/* Left Side: Upload & Controls */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
             <FileDrop 
              onFilesSelected={handleFileSelected} 
              multiple={false}
              description="Upload PDF"
            />
             <div className="mt-4">
              {file && <FileList files={[file]} onRemove={handleRemoveFile} />}
            </div>

            <div className="mt-6">
              {isProcessing ? (
                <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                   <div className="flex justify-between text-sm mb-2 text-slate-700">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                        <span className="font-medium">Extracting...</span>
                      </div>
                      <span className="font-bold text-blue-600">{progress}%</span>
                   </div>
                   <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                     <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${Math.max(5, progress)}%` }}
                     ></div>
                   </div>
                </div>
              ) : (
                <Button 
                   onClick={handleExtract} 
                   disabled={!file}
                   icon={<FileText size={18} />}
                   className="w-full"
                >
                  Extract Text
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Output */}
        <div className="md:col-span-2 h-[500px] md:h-auto flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-slate-700">Extracted Content</h3>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                disabled={!text} 
                onClick={handleCopy}
                title="Copy to Clipboard"
                className="!p-2"
              >
                <Copy size={18} />
              </Button>
              <Button 
                variant="secondary" 
                disabled={!text} 
                onClick={handleDownload}
                className="!py-1.5 !px-3 !text-xs"
                icon={<Download size={14} />}
              >
                Download .txt
              </Button>
            </div>
          </div>
          <div className="flex-1 relative">
            <textarea
              readOnly
              value={text}
              placeholder="Text content will appear here..."
              className="absolute inset-0 w-full h-full p-6 resize-none focus:outline-none text-slate-700 font-mono text-sm leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfToText;