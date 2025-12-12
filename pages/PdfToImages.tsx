import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { convertPdfToImageBlobs, downloadBlob } from '../services/pdfService';
import { Image, Download, Archive, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import JSZip from 'jszip';

const PdfToImages: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [resultZip, setResultZip] = useState<Blob | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      setResultZip(null);
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResultZip(null);
    setProgress(0);
    setErrorMessage(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    
    try {
      // 1. Convert pages to image blobs
      const blobs = await convertPdfToImageBlobs(file, 'jpeg', (p) => setProgress(p));
      
      // 2. Zip them
      setIsZipping(true);
      const zip = new JSZip();
      const name = file.name.replace(/\.pdf$/i, '');
      
      blobs.forEach((blob, index) => {
        zip.file(`${name}-page-${index + 1}.jpg`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setResultZip(zipBlob);

    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('Password')) {
        setErrorMessage("The PDF is password protected. Please unlock it first.");
      } else {
        setErrorMessage("Failed to convert PDF to images. The file might be corrupted.");
      }
    } finally {
      setIsProcessing(false);
      setIsZipping(false);
    }
  };

  const handleDownload = () => {
    if (resultZip && file) {
      const name = file.name.replace(/\.pdf$/i, '');
      downloadBlob(resultZip, `${name}-images.zip`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">PDF to Images</h1>
        <p className="text-slate-500">Convert each page of your PDF into high-quality JPG images.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {!resultZip ? (
          <>
            <FileDrop 
              onFilesSelected={handleFilesSelected} 
              multiple={false}
              description="Drop a PDF file here to convert"
            />
            
            <div className="mt-6">
              {file && (
                <FileList files={[file]} onRemove={handleRemoveFile} />
              )}
            </div>

            {file && (
              <div className="mt-8 pt-4">
                 {isProcessing ? (
                   <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                     <div className="flex justify-between text-sm mb-2 text-slate-700">
                        <div className="flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-blue-600" />
                          <span className="font-medium">
                            {isZipping ? "Creating ZIP archive..." : "Converting pages..."}
                          </span>
                        </div>
                        {!isZipping && <span className="font-bold text-blue-600">{progress}%</span>}
                     </div>
                     <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                       <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${isZipping ? 100 : Math.max(5, progress)}%` }}
                       ></div>
                     </div>
                   </div>
                 ) : (
                   <div className="flex justify-end">
                     <Button 
                       onClick={handleConvert} 
                       icon={<Image size={18} />}
                       className="w-full sm:w-auto"
                     >
                       Convert to JPG
                     </Button>
                   </div>
                 )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Conversion Complete!</h2>
            <p className="text-slate-500 mb-8">Your images are ready to download.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload} 
                icon={<Archive size={18} />}
                className="w-full sm:w-auto"
              >
                Download ZIP Images
              </Button>
              <Button 
                variant="secondary"
                onClick={() => { setResultZip(null); setProgress(0); }} 
                icon={<ArrowRight size={18} />}
                className="w-full sm:w-auto"
              >
                Convert Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfToImages;