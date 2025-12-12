export type ImageCompressionLevel = 'balanced' | 'high' | 'extreme';

export const compressImage = async (file: File, level: ImageCompressionLevel): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      let quality = 0.8;
      
      // Configuration based on level
      if (level === 'balanced') {
        quality = 0.8;
        // Keep original dimensions
      } else if (level === 'high') {
        quality = 0.6;
        // Max dimension 2048px
        const max = 2048;
        if (width > max || height > max) {
            const ratio = Math.min(max / width, max / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }
      } else if (level === 'extreme') {
        quality = 0.4;
        // Max dimension 1280px
        const max = 1280;
        if (width > max || height > max) {
            const ratio = Math.min(max / width, max / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw white background to handle transparency (converting PNG/WebP to JPEG)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compress to JPEG
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error('Compression failed'));
        else resolve(blob);
      }, 'image/jpeg', quality);
    };

    reader.readAsDataURL(file);
  });
};