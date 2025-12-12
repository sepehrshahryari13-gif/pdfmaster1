import React, { useState } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { splitPdf, getPdfPageCount, downloadBlob } from '../services/pdfService';
import { Scissors, Download, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import JSZip from 'jszip';

type SplitMode = 'all' | 'ranges';

const SplitPdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [mode, setMode] = useState<SplitMode>('all');
  const [rangeString, setRangeString] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [resultZip, setResultZip] = useState<Blob | null>(null);

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      setFile(newFiles[0]);
      setResultZip(null);
      setProgress(0);
      setErrorMessage(null);
      try {
        const count = await getPdfPageCount(newFiles[0]);
        setPageCount(count);
      } catch (e: any) {
        console.error("Error loading PDF", e);
        setErrorMessage("Could not load the PDF. It might be password protected or corrupted.");
        setFile(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setResultZip(null);
    setPageCount(0);
    setRangeString('');
    setErrorMessage(null);
  };

  const parseRanges = (str: string, maxPages: number): number[][] => {
    const groups: number[][] = [];
    const parts = str.split(',').map(s => s.trim()).filter(s => s);
    
    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) {
          const indices: number[] = [];
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= maxPages) indices.push(i - 1);
          }
          if (indices.length > 0) groups.push(indices);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          groups.push([page - 1]);
        }
      }
    });
    return groups;
  };

  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setErrorMessage(null);

    try {
      let pageGroups: number[][] = [];

      if (mode === 'all') {
        for (let i = 0; i < pageCount; i++) {
          pageGroups.push([i]);
        }
      } else {
        pageGroups = parseRanges(rangeString, pageCount);
        if (pageGroups.length === 0) {
          setErrorMessage("Please enter valid page ranges (e.g., 1-5, 8, 10-12) within the document limits.");
          setIsProcessing(false);
          return;
        }
      }

      const pdfBytesArray = await splitPdf(file, pageGroups, (p) => setProgress(p));
      
      const zip = new JSZip();
      const baseName = file.name.replace(/\.pdf$/i, '');
      
      pdfBytesArray.forEach((bytes, idx) => {
        let fileName = `${baseName}-split-${idx + 1}.pdf`;
        zip.file(fileName, bytes);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setResultZip(zipBlob);

    } catch (error: any) {
      console.error(error);
      setErrorMessage("An error occurred while splitting the PDF. Please try again with a different file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultZip && file) {
      const name = file.name.replace(/\.pdf$/i, '');
      downloadBlob(resultZip, `${name}-split-files.zip`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Split PDF</h1>
        <p className="text-slate-500">Extract pages or split your PDF file into multiple documents.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

        {!resultZip ? (
          <>
            <FileDrop 
              onFilesSelected={handleFileSelected} 
              multiple={false}
              description="Drop a PDF file here to split"
            />
            
            <div className="mt-6">
              {file && (
                <FileList files={[file]} onRemove={handleRemoveFile} />
              )}
            </div>

            {file && (
              <div className="mt-8 space-y-6">
                 <div>
                   <label className="text-sm font-medium text-slate-700 mb-3 block">Split Options</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div 
                       onClick={() => setMode('all')}
                       className={`cursor-pointer border rounded-xl p-4 transition-all ${mode === 'all' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'all' ? 'border-blue-600' : 'border-slate-400'}`}>
                           {mode === 'all' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                         </div>
                         <span className="font-semibold text-slate-900 text-sm">Extract All Pages</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-2 ml-7">Save every single page as a separate PDF file.</p>
                     </div>

                     <div 
                       onClick={() => setMode('ranges')}
                       className={`cursor-pointer border rounded-xl p-4 transition-all ${mode === 'ranges' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-blue-300'}`}
                     >
                       <div className="flex items-center gap-3">
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${mode === 'ranges' ? 'border-blue-600' : 'border-slate-400'}`}>
                           {mode === 'ranges' && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                         </div>
                         <span className="font-semibold text-slate-900 text-sm">Custom Ranges</span>
                       </div>
                       <p className="text-xs text-slate-500 mt-2 ml-7">Specify which pages to extract (e.g. "1-5, 10").</p>
                     </div>
                   </div>
                 </div>

                 {mode === 'ranges' && (
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <label className="text-sm font-medium text-slate-700 mb-2 block">Enter Page Ranges</label>
                     <input 
                       type="text" 
                       value={rangeString}
                       onChange={(e) => setRangeString(e.target.value)}
                       placeholder={`e.g. 1-5, 8, 11-${Math.min(15, pageCount)}`}
                       className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                     />
                     <p className="text-xs text-slate-500 mt-2">
                       Total pages in document: <strong>{pageCount}</strong>. Separate groups with commas.
                     </p>
                   </div>
                 )}

                 <div className="pt-2">
                   {isProcessing ? (
                     <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100">
                       <div className="flex justify-between text-sm mb-2 text-slate-700">
                          <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="font-medium">Splitting PDF...</span>
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
                     <div className="flex justify-end">
                       <Button 
                         onClick={handleSplit} 
                         icon={<Scissors size={18} />}
                         disabled={mode === 'ranges' && !rangeString}
                         className="w-full sm:w-auto"
                       >
                         Split PDF
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
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Split Complete!</h2>
            <p className="text-slate-500 mb-8">Your files are ready in a ZIP archive.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleDownload} 
                icon={<Download size={18} />}
                className="w-full sm:w-auto"
              >
                Download ZIP
              </Button>
              <Button 
                variant="secondary"
                onClick={() => { setResultZip(null); setProgress(0); }} 
                icon={<RefreshCw size={18} />}
                className="w-full sm:w-auto"
              >
                Split Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPdf;