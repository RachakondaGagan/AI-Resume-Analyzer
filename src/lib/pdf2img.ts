import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export interface PdfConversionResult {
  imageUrl: string;
  pageImages: string[];
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;
  loadPromise = import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = pdfWorker;
    pdfjsLib = lib;
    return lib;
  });
  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    const pageCanvases: HTMLCanvasElement[] = [];
    const pageImages: string[] = [];
    let totalWidth = 0;
    let totalHeight = 0;

    // Render up to 3 pages at high-res close-up scale
    for (let i = 1; i <= Math.min(numPages, 3); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (ctx) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; }
      await page.render({ canvasContext: ctx!, viewport }).promise;

      pageCanvases.push(canvas);
      pageImages.push(canvas.toDataURL('image/jpeg', 0.85));
      totalWidth = Math.max(totalWidth, viewport.width);
      totalHeight += viewport.height;
    }

    // Stitch pages vertically for AI analysis payload
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = totalWidth;
    mergedCanvas.height = totalHeight;
    const mergedCtx = mergedCanvas.getContext('2d');

    if (mergedCtx) {
      mergedCtx.fillStyle = '#ffffff';
      mergedCtx.fillRect(0, 0, totalWidth, totalHeight);
      let currentY = 0;
      for (const canvas of pageCanvases) {
        mergedCtx.drawImage(canvas, 0, currentY);
        currentY += canvas.height;
      }
    }

    return new Promise((resolve) => {
      mergedCanvas.toBlob((blob) => {
        if (blob) {
          const name = file.name.replace(/\.pdf$/i, '');
          resolve({
            imageUrl: URL.createObjectURL(blob),
            pageImages,
            file: new File([blob], `${name}.jpg`, { type: 'image/jpeg' }),
          });
        } else {
          resolve({ imageUrl: '', pageImages: [], file: null, error: 'Blob creation failed' });
        }
      }, 'image/jpeg', 0.8);
    });
  } catch (err) {
    return { imageUrl: '', pageImages: [], file: null, error: String(err) };
  }
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}
