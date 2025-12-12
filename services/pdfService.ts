import { PDFDocument, rgb, degrees } from 'pdf-lib';
import FileSaver from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

// Helper to handle both CommonJS and ESM export styles for file-saver
const saveAs = (blob: Blob, name: string) => {
  const saver = (FileSaver as any).saveAs || FileSaver;
  // @ts-ignore
  saver(blob, name);
};

export const downloadBlob = (blob: Blob, filename: string) => {
  saveAs(blob, filename);
};

export const mergePdfs = async (files: File[]): Promise<void> => {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `merged-document-${Date.now()}.pdf`);
};

export const imagesToPdf = async (files: File[]): Promise<void> => {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    let image;

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer);
    } else {
      continue; // Skip unsupported formats
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `images-converted-${Date.now()}.pdf`);
};

export type CompressionLevel = 'standard' | 'high';
export type ProgressCallback = (percent: number) => void;

// Rasterizes pages to JPEGs to achieve high compression
const compressByRasterization = async (file: File, onProgress?: ProgressCallback): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the document with pdfjs
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  
  // Create a new PDF writer
  const newPdfDoc = await PDFDocument.create();
  const totalPages = pdf.numPages;
  
  for (let i = 1; i <= totalPages; i++) {
    // Notify start of page
    if (onProgress) {
        // Map 0-90% to page processing
        const percent = Math.round(((i - 1) / totalPages) * 90);
        onProgress(percent);
    }

    const page = await pdf.getPage(i);
    
    // 1.5 scale is a balance between readability and file size. 
    // For "High" compression we accept some quality loss.
    // 72dpi * 1.5 = 108dpi approx.
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) continue;

    // Fix: Cast to any to bypass "Property 'canvas' is missing in type" error from pdfjs-dist types
    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise;

    // Compress to JPEG with quality 0.6 (60%)
    const blob = await new Promise<Blob | null>(resolve => 
      canvas.toBlob(resolve, 'image/jpeg', 0.6)
    );
    
    if (blob) {
      const imgBuffer = await blob.arrayBuffer();
      const embeddedImage = await newPdfDoc.embedJpg(imgBuffer);
      
      const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }
    
    // Clean up
    canvas.remove();
  }
  
  if (onProgress) onProgress(95);
  const result = await newPdfDoc.save();
  if (onProgress) onProgress(100);
  
  return result;
};

export const compressPdf = async (file: File, level: CompressionLevel, onProgress?: ProgressCallback): Promise<Uint8Array> => {
  if (level === 'high') {
    // High compression uses rasterization (destructive but effective)
    try {
      return await compressByRasterization(file, onProgress);
    } catch (e) {
      console.warn("Rasterization failed, falling back to standard compression", e);
      // Fallback if something goes wrong with rendering
    }
  }

  // Standard compression: Lossless structure cleanup
  if (onProgress) onProgress(10);
  const arrayBuffer = await file.arrayBuffer();
  
  if (onProgress) onProgress(30);
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  if (onProgress) onProgress(50);
  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
  copiedPages.forEach((page) => newPdf.addPage(page));

  if (onProgress) onProgress(70);
  const pdfBytes = await newPdf.save({ useObjectStreams: true });
  
  if (onProgress) onProgress(100);
  return pdfBytes;
};

// --- PDF to Image & Organize Features ---

export const getPdfPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}

// Render a single PDF page to a base64 Data URL (for UI thumbnails)
export const renderPdfPageToDataURL = async (file: File, pageIndex: number, scale = 0.3): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  
  // pageIndex is 1-based for pdfjs
  const page = await pdf.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  const context = canvas.getContext('2d');
  if (!context) return '';

  await page.render({
    canvasContext: context,
    viewport: viewport,
  } as any).promise;

  return canvas.toDataURL('image/jpeg', 0.8);
};

// Convert all pages to Blobs (high quality)
export const convertPdfToImageBlobs = async (
  file: File, 
  format: 'png' | 'jpeg' = 'jpeg', 
  onProgress?: ProgressCallback
): Promise<Blob[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const blobs: Blob[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) {
        onProgress(Math.round(((i - 1) / totalPages) * 100));
    }

    const page = await pdf.getPage(i);
    // Scale 2.0 provides good quality (approx 144dpi)
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext('2d');
    if (!context) continue;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise;

    const blob = await new Promise<Blob | null>(resolve => 
      canvas.toBlob(resolve, `image/${format}`, 0.9)
    );
    
    if (blob) blobs.push(blob);
    canvas.remove();
  }
  
  if (onProgress) onProgress(100);
  return blobs;
};

export interface PageConfig {
  originalIndex: number; // 0-based
  rotation: number; // degrees (0, 90, 180, 270)
}

// Create a new PDF based on a list of selected pages and rotations
export const saveOrganizedPdf = async (file: File, pages: PageConfig[]): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  // Map original indices to pages
  const indices = pages.map(p => p.originalIndex);
  // Copy pages: this allows reordering and duplication
  const copiedPages = await newDoc.copyPages(srcDoc, indices);

  pages.forEach((pageConfig, i) => {
    const page = copiedPages[i];
    // Add existing rotation to new rotation
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees(currentRotation + pageConfig.rotation));
    newDoc.addPage(page);
  });

  return await newDoc.save();
};

// --- Split & Text Extraction ---

// Split PDF into multiple files based on arrays of page indices
export const splitPdf = async (file: File, pageGroups: number[][], onProgress?: ProgressCallback): Promise<Uint8Array[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const resultBytes: Uint8Array[] = [];

  let totalGroups = pageGroups.length;
  for (let i = 0; i < totalGroups; i++) {
      if (onProgress) onProgress(Math.round((i / totalGroups) * 100));
      const subDoc = await PDFDocument.create();
      const indices = pageGroups[i];
      // Check indices
      const validIndices = indices.filter(idx => idx >= 0 && idx < srcDoc.getPageCount());
      if (validIndices.length === 0) continue;

      const copiedPages = await subDoc.copyPages(srcDoc, validIndices);
      copiedPages.forEach(page => subDoc.addPage(page));
      const bytes = await subDoc.save();
      resultBytes.push(bytes);
  }
  if (onProgress) onProgress(100);
  return resultBytes;
};

// Extract text from PDF
export const extractTextFromPdf = async (file: File, onProgress?: ProgressCallback): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(Math.round((i / pdf.numPages) * 100));
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
  }
  if (onProgress) onProgress(100);
  return fullText;
};