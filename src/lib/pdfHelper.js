// PDF.js Helper for Extracting Covers and Rendering Pages dynamically

export const initPdfJs = () => {
  if (typeof window !== 'undefined' && window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
};

/**
 * Reads a PDF File, extracts its Page 1 as a JPEG Data URL (Cover),
 * extracts total page count, and renders pages into Data URLs.
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
            pdfArrayBuffer: arrayBuffer,
            pageCount: 1,
            coverImage: null
          });
          return;
        }

        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        // Render Page 1 for Cover Image
        const page1 = await pdfDoc.getPage(1);
        const viewport = page1.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page1.render({ canvasContext: context, viewport }).promise;
        const coverDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        // Render up to 50 pages into Data URLs for instant flipbook browsing
        const pagesDataUrls = [];
        const maxPagesToPreRender = Math.min(totalPages, 50);

        for (let pageNum = 1; pageNum <= maxPagesToPreRender; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const pViewport = page.getViewport({ scale: 1.2 });
          const pCanvas = document.createElement('canvas');
          const pContext = pCanvas.getContext('2d');
          pCanvas.height = pViewport.height;
          pCanvas.width = pViewport.width;

          await page.render({ canvasContext: pContext, viewport: pViewport }).promise;
          pagesDataUrls.push(pCanvas.toDataURL('image/jpeg', 0.8));
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
