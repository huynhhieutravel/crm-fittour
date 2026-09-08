import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Nạp document PDF từ File đối tượng (trên trình duyệt)
 * @param {File|Blob} file 
 * @returns {Promise<pdfjsLib.PDFDocumentProxy>}
 */
export async function loadPdfDocument(file) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  return await loadingTask.promise;
}

/**
 * Render một trang cụ thể của PDF ra HTML5 Canvas với tỷ lệ scale tối ưu
 * @param {pdfjsLib.PDFDocumentProxy} pdfDoc 
 * @param {number} pageNumber (1-indexed)
 * @param {number} scale Tỷ lệ phóng đại (mặc định 1.8x ~ 150-200 DPI cho OCR sắc nét)
 * @returns {Promise<{ canvas: HTMLCanvasElement, cleanup: Function, width: number, height: number }>}
 */
export async function renderPdfPageToCanvas(pdfDoc, pageNumber, scale = 1.8) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  // Thu hồi bộ nhớ trang và canvas sau khi dùng xong
  const cleanup = () => {
    canvas.width = 0;
    canvas.height = 0;
    try {
      page.cleanup();
    } catch (e) {
      // ignore
    }
  };

  return { canvas, cleanup, width: viewport.width, height: viewport.height };
}

/**
 * Chuyển đổi canvas thành Blob để lưu trữ hoặc upload nếu cần
 * @param {HTMLCanvasElement} canvas 
 * @param {string} type 
 * @param {number} quality 
 * @returns {Promise<Blob>}
 */
export function canvasToBlob(canvas, type = 'image/jpeg', quality = 0.92) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}
