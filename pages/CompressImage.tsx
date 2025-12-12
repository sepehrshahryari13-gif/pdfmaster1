import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { compressImage, ImageCompressionLevel } from '../services/imageService';
import { downloadBlob } from '../services/pdfService';
import { Minimize2, Download, ArrowRight, CheckCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const CompressImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<ImageCompressionLevel>('high');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const compressedBlob = await compressImage(file, level);
      
      setResult({
        originalSize: file.size,
        newSize: compressedBlob.size,
        blob: compressedBlob
      });
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Image compression failed. The file format might not be supported.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result && file) {
      // Change extension to .jpg as we output JPEG
      const nameParts = file.name.split('.');
      const nameWithoutExt = nameParts.slice(0, -1).join('.');
      downloadBlob(result.blob, `compressed-${nameWithoutExt}.jpg`);
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
        <h1 className="text-3xl font-bold text-slate-900">Compress Image</h1>
        <p className="text-slate-500">Reduce image size (JPG, PNG, WebP) intelligently.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {!result ? (
          <>
            <FileDrop 
              onFilesSelected={handleFilesSelected} 
              multiple={false}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              description="Drop an image file here to compress"
            />
            
            <div className="mt-6">
              {file && (
                <FileList files={[file]} onRemove={handleRemoveFile} />
              )}
            </div>

            {file && (
              <div className="mt-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-3 block">Compression Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      onClick={() => setLevel('balanced')}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${level === 'balanced' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border mb-3 flex items-center justify-center ${level === 'balanced' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {level === 'balanced' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="block font-semibold text-slate-900 text-sm">Balanced</span>
                      <span className="text-xs text-slate-500 mt-1">Quality 80%</span>
                    </div>

                    <div 
                      onClick={() => setLevel('high')}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${level === 'high' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border mb-3 flex items-center justify-center ${level === 'high' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {level === 'high' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="block font-semibold text-slate-900 text-sm">High</span>
                      <span className="text-xs text-slate-500 mt-1">Quality 60% + Resize</span>
                    </div>

                    <div 
                      onClick={() => setLevel('extreme')}
                      className={`cursor-pointer border rounded-xl p-4 transition-all ${level === 'extreme' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className={`w-4 h-4 rounded-full border mb-3 flex items-center justify-center ${level === 'extreme' ? 'border-blue-600' : 'border-slate-400'}`}>
                        {level === 'extreme' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="block font-semibold text-slate-900 text-sm">Extreme</span>
                      <span className="text-xs text-slate-500 mt-1">Quality 40% + Resize</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                   <Button 
                     onClick={handleCompress} 
                     isLoading={isProcessing}
                     icon={<Minimize2 size={18} />}
                     className="w-full sm:w-auto"
                   >
                     Compress Image
                   </Button>
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
            <p className="text-slate-500 mb-8">Your image has been processed.</p>

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
                 {getPercentage() > 0 ? `Reduced by ${getPercentage()}%` : 'No reduction'}
               </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload} 
                icon={<Download size={18} />}
                className="w-full sm:w-auto"
              >
                Download Image
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

export default CompressImage;