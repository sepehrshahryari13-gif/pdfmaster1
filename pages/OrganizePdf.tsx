import React, { useState, useEffect } from 'react';
import { FileDrop, FileList } from '../components/FileDrop';
import { Button } from '../components/Button';
import { ErrorAlert } from '../components/ErrorAlert';
import { getPdfPageCount, renderPdfPageToDataURL, saveOrganizedPdf, downloadBlob } from '../services/pdfService';
import { Layers, RotateCw, Trash2, Save, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

interface PageItem {
  originalIndex: number;
  rotation: number;
  thumbnail: string;
  id: number;
}

const OrganizePdf: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      setFile(f);
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const count = await getPdfPageCount(f);
        const newPages: PageItem[] = [];
        
        for (let i = 0; i < count; i++) {
          const url = await renderPdfPageToDataURL(f, i);
          newPages.push({
            originalIndex: i,
            rotation: 0,
            thumbnail: url,
            id: Math.random()
          });
        }
        setPages(newPages);
      } catch (e: any) {
        console.error(e);
        if (e.message && e.message.includes('Password')) {
           setErrorMessage("The PDF is password protected. Please unlock it to organize pages.");
        } else {
           setErrorMessage("Could not load PDF pages. The file might be corrupted.");
        }
        setFile(null); // Reset file if failed load
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRotate = (index: number) => {
    setPages(prev => prev.map((p, i) => {
      if (i === index) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    }));
  };

  const handleDelete = (index: number) => {
    setPages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index > 0) {
      setPages(prev => {
        const newArr = [...prev];
        const temp = newArr[index];
        newArr[index] = newArr[index - 1];
        newArr[index - 1] = temp;
        return newArr;
      });
    } else if (direction === 'right' && index < pages.length - 1) {
       setPages(prev => {
        const newArr = [...prev];
        const temp = newArr[index];
        newArr[index] = newArr[index + 1];
        newArr[index + 1] = temp;
        return newArr;
      });
    }
  };

  const handleSave = async () => {
    if (!file || pages.length === 0) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const pdfBytes = await saveOrganizedPdf(file, pages.map(p => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation
      })));
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `organized-${file.name}`);
    } catch (e: any) {
      console.error(e);
      setErrorMessage("Failed to save the PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPages([]);
    setErrorMessage(null);
  };

  if (!file) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Organize PDF</h1>
          <p className="text-slate-500">Rearrange, rotate, or remove pages from your PDF.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />
          <FileDrop 
            onFilesSelected={handleFilesSelected} 
            multiple={false}
            description="Drop a PDF file here to organize"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-20 z-40">
        <div>
           <h2 className="font-bold text-slate-800">{file.name}</h2>
           <p className="text-sm text-slate-500">{pages.length} pages</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            isLoading={isSaving}
            icon={<Save size={18} />}
          >
            Save PDF
          </Button>
        </div>
      </div>

      <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="text-slate-500">Loading pages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {pages.map((page, idx) => (
            <div key={page.id} className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
              <div className="bg-slate-100 flex-grow relative flex items-center justify-center p-4 min-h-[200px]">
                 <div 
                   className="relative shadow-lg transition-transform duration-300"
                   style={{ transform: `rotate(${page.rotation}deg)` }}
                 >
                   <img src={page.thumbnail} alt={`Page ${idx + 1}`} className="max-w-full max-h-[180px] object-contain bg-white" />
                 </div>
                 
                 <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                   {idx + 1}
                 </div>

                 {/* Hover Controls */}
                 <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleRotate(idx)}
                      className="p-2 bg-white text-slate-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="Rotate"
                    >
                      <RotateCw size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(idx)}
                      className="p-2 bg-white text-slate-700 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                 </div>
              </div>
              
              <div className="p-2 border-t border-slate-100 flex justify-between bg-white">
                 <button 
                   onClick={() => handleMove(idx, 'left')} 
                   disabled={idx === 0}
                   className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                 >
                   <ArrowLeft size={16} />
                 </button>
                 <span className="text-xs text-slate-400 font-medium py-1">Page {page.originalIndex + 1}</span>
                 <button 
                   onClick={() => handleMove(idx, 'right')} 
                   disabled={idx === pages.length - 1}
                   className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400"
                 >
                   <ArrowRight size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizePdf;