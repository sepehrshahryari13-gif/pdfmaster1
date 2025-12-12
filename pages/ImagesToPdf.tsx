import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { imagesToPdf } from '../services/pdfService';
import { FileImage, Download } from 'lucide-react';

const ImagesToPdf: React.FC = () => {
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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      await imagesToPdf(files);
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Failed to convert images. Please ensure they are valid JPG or PNG files and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Images to PDF</h1>
        <p className="text-slate-500">Convert JPG and PNG images into a single PDF document.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
        
        <FileDrop 
          onFilesSelected={handleFilesSelected} 
          multiple={true}
          accept="image/png, image/jpeg, image/jpg"
          description="Drop images here (JPG, PNG)"
        />
        
        <div className="mt-6">
          <FileList files={files} onRemove={handleRemoveFile} />
        </div>

        {files.length > 0 && (
          <div className="mt-8 flex justify-end">
             <Button 
               onClick={handleConvert} 
               isLoading={isProcessing}
               icon={<Download size={18} />}
               className="w-full sm:w-auto"
             >
               Convert to PDF
             </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagesToPdf;