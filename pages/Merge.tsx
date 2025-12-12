import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { mergePdfs } from '../services/pdfService';
import { Merge as MergeIcon, Download } from 'lucide-react';

const Merge: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setErrorMessage(null);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await mergePdfs(files);
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('Password')) {
        setErrorMessage("One or more files are password protected. Please remove encryption before merging.");
      } else {
        setErrorMessage("Failed to merge PDFs. The files might be corrupted or contain unsupported features.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Merge PDF Files</h1>
        <p className="text-slate-500">Combine multiple PDFs into one unified document.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        
        <FileDrop 
          onFilesSelected={handleFilesSelected} 
          multiple={true}
          description="Drop PDF files here to merge"
        />
        
        <div className="mt-6">
          <FileList files={files} onRemove={handleRemoveFile} />
        </div>

        {files.length > 0 && (
          <div className="mt-8 flex justify-end">
             <Button 
               onClick={handleMerge} 
               disabled={files.length < 2}
               isLoading={isProcessing}
               icon={files.length < 2 ? <MergeIcon size={18}/> : <Download size={18} />}
               className="w-full sm:w-auto"
             >
               {files.length < 2 ? 'Add at least 2 files' : 'Merge PDF'}
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Merge;