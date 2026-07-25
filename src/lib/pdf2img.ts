import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;
  loadPromise = import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = pdfWorker || `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/build/pdf.worker.min.mjs`;
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
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (ctx) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; }
    await page.render({ canvasContext: ctx!, viewport }).promise;
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const name = file.name.replace(/\.pdf$/i, '');
          resolve({ imageUrl: URL.createObjectURL(blob), file: new File([blob], `${name}.png`, { type: 'image/png' }) });
        } else {
          resolve({ imageUrl: '', file: null, error: 'Blob creation failed' });
        }
      }, 'image/png', 1.0);
    });
  } catch (err) {
    return { imageUrl: '', file: null, error: String(err) };
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
