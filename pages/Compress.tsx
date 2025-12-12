import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { compressPdf, CompressionLevel, downloadBlob } from '../services/pdfService';
import { Minimize2, Download, ArrowRight, CheckCircle, BarChart3, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Compress: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>('high');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{
    originalSize: number;
    newSize: number;
    blob: Blob;
  } | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      setResult(null); 
      setErrorMessage(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const pdfBytes = await compressPdf(file, level, (percent) => {
        setProgress(percent);
      });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      setResult({
        originalSize: file.size,
        newSize: blob.size,
        blob: blob
      });
    } catch (error: any) {
      console.error(error);
      if (error.message && error.message.includes('Password')) {
        setErrorMessage("The PDF is password protected. Please unlock it before compressing.");
      } else {
        setErrorMessage("Failed to compress PDF. The file might be corrupted or in an unsupported format.");
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      downloadBlob(result.blob, `compressed-${file.name}`);
    }
  };

  const getPercentage = () => {
    if (!result) return 0;
    const savings = result.originalSize - result.newSize;
    if (savings <= 0) return 0;
    return Math.round((savings / result.originalSize) * 100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Compress PDF</h1>
        <p className="text-slate-500">Reduce your PDF file size. Secure client-side processing.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {!result ? (
          <>
            <FileDrop 
              onFilesSelected={handleFilesSelected} 
              multiple={false}
              description="Drop a PDF file here to compress"
            />
            
            <div className="mt-6">
              {file && (
                <FileList files={[file]} onRemove={handleRemoveFile} />
              )}
            </div>

            {file && (
              <div className="mt-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Compression Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => !isProcessing && setLevel('standard')}
                      className={`cursor-pointer border rounded-xl p-4 flex items-start space-x-3 transition-all ${level === 'standard' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${level === 'standard' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {level === 'standard' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-900 text-sm">Standard (Lossless)</span>
                        <span className="text-xs text-slate-500 mt-1 block">Removes unused data. Keeps text selectable. Best for text documents.</span>
                        <span className="text-xs text-blue-600 mt-1 block">Low compression ratio</span>
                      </div>
                    </div>

                    <div 
                      onClick={() => !isProcessing && setLevel('high')}
                      className={`cursor-pointer border rounded-xl p-4 flex items-start space-x-3 transition-all ${level === 'high' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${level === 'high' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {level === 'high' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <div>
                        <span className="block font-semibold text-slate-900 text-sm">Strong (Lossy)</span>
                        <span className="text-xs text-slate-500 mt-1 block">Converts pages to images. Text becomes unselectable. Best for scans & large files.</span>
                        <span className="text-xs text-green-600 mt-1 block font-medium">High compression ratio</span>
                      </div>
                    </div>
                  </div>
                </div>

                {level === 'high' && (
                   <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm flex gap-2 items-start">
                     <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                     <p>Strong compression will flatten your document into images. You won't be able to select or search text in the output file.</p>
                   </div>
                )}

                <div className="pt-4">
                   {isProcessing ? (
                     <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex justify-between text-sm mb-2 text-slate-700">
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="font-medium">Compressing PDF...</span>
                          </div>
                          <span className="font-bold text-blue-600">{progress}%</span>
                       </div>
                       <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                         <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                            style={{ width: `${Math.max(5, progress)}%` }}
                         ></div>
                       </div>
                       <p className="text-xs text-slate-500 mt-2 text-center">
                          {level === 'high' ? 'Rendering and compressing pages... This might take a minute.' : 'Optimizing file structure...'}
                       </p>
                     </div>
                   ) : (
                     <div className="flex justify-end">
                       <Button 
                         onClick={handleCompress} 
                         icon={<Minimize2 size={18} />}
                         className="w-full sm:w-auto"
                       >
                         Compress PDF
                       </Button>
                     </div>
                   )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Compression Complete!</h2>
            <p className="text-slate-500 mb-8">Your PDF has been processed successfully.</p>

            <div className="bg-slate-50 rounded-xl p-6 max-w-md mx-auto mb-8 border border-slate-200">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-left">
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Original</p>
                   <p className="font-medium text-slate-900">{formatSize(result.originalSize)}</p>
                 </div>
                 <ArrowRight className="text-slate-300" />
                 <div className="text-right">
                   <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Compressed</p>
                   <p className="font-bold text-blue-600">{formatSize(result.newSize)}</p>
                 </div>
               </div>
               
               <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                 <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.max(5, 100 - getPercentage())}%` }}></div>
               </div>
               <p className="text-xs text-center text-slate-500">
                 {getPercentage() > 0 ? `Reduced by ${getPercentage()}%` : 'File size did not decrease (already optimized)'}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload} 
                icon={<Download size={18} />}
                className="w-full sm:w-auto"
              >
                Download PDF
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setResult(null)} 
                icon={<RefreshCw size={18} />}
                className="w-full sm:w-auto"
              >
                Compress Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compress;