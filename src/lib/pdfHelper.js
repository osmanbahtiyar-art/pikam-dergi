// PDF.js Helper for Extracting Covers and Rendering Pages dynamically with Payload Compression

export const initPdfJs = () => {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
};

/**
 * Reads a PDF File, extracts Page 1 as an optimized JPEG Data URL (Cover),
 * extracts total page count, and renders pages into lightweight JPEG Data URLs.
 */
export const processPdfFile = async (file) => {
  initPdfJs();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        
        if (!window.pdfjsLib) {
          console.warn('PDF.js library not loaded yet');
          resolve({
            pageCount: 1,
            coverImage: null,
            pagesDataUrls: []
          });
          return;
        }

        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        // 1. Render Page 1 for Cover Image (Optimized max width 600px, quality 0.7)
        const page1 = await pdfDoc.getPage(1);
        const unscaledVP = page1.getViewport({ scale: 1.0 });
        const coverScale = Math.min(1.2, 600 / unscaledVP.width);
        const coverViewport = page1.getViewport({ scale: coverScale });

        const coverCanvas = document.createElement('canvas');
        const coverContext = coverCanvas.getContext('2d');
        coverCanvas.height = coverViewport.height;
        coverCanvas.width = coverViewport.width;

        await page1.render({ canvasContext: coverContext, viewport: coverViewport }).promise;
        const coverDataUrl = coverCanvas.toDataURL('image/jpeg', 0.7);

        // 2. Render up to 40 pages into lightweight Data URLs (max width 450px, quality 0.5)
        const pagesDataUrls = [];
        const maxPagesToPreRender = Math.min(totalPages, 40);

        for (let pageNum = 1; pageNum <= maxPagesToPreRender; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const pUnscaled = page.getViewport({ scale: 1.0 });
          const pScale = Math.min(1.0, 450 / pUnscaled.width);
          const pViewport = page.getViewport({ scale: pScale });

          const pCanvas = document.createElement('canvas');
          const pContext = pCanvas.getContext('2d');
          pCanvas.height = pViewport.height;
          pCanvas.width = pViewport.width;

          await page.render({ canvasContext: pContext, viewport: pViewport }).promise;
          pagesDataUrls.push(pCanvas.toDataURL('image/jpeg', 0.5));
        }

        resolve({
          pageCount: totalPages,
          coverImage: coverDataUrl,
          pagesDataUrls
        });
      } catch (err) {
        console.error('Error processing PDF file with PDF.js:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};
