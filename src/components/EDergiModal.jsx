import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, BookOpen, Loader2 } from 'lucide-react';

export default function EDergiModal({ issue, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [renderedPdfPage, setRenderedPdfPage] = useState(null);
  const [isRenderingPage, setIsRenderingPage] = useState(false);

  if (!issue) return null;

  const totalPages = issue.pageCount || (issue.pagesDataUrls ? issue.pagesDataUrls.length : 68);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleDownloadPdf = () => {
    if (!issue.pdfUrl || issue.pdfUrl === '#') {
      alert('Dergi PDF dosyası henüz yüklenmemiştir.');
      return;
    }

    const fileName = issue.pdfFileName || `PIKAM-Dergi-${(issue.issueNumber || '').replace(' ', '-')}.pdf`;

    if (issue.pdfUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const base64Data = issue.pdfUrl.split(',')[1];
        const binaryStr = atob(base64Data);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch (err) {
        console.error('Download error:', err);
        window.open(issue.pdfUrl, '_blank');
      }
    } else {
      const a = document.createElement('a');
      a.href = issue.pdfUrl;
      a.target = '_blank';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Render PDF page dynamically using PDF.js
  useEffect(() => {
    let isMounted = true;

    // Check pre-rendered pages array
    if (issue.pagesDataUrls && issue.pagesDataUrls[currentPage - 1]) {
      setRenderedPdfPage(issue.pagesDataUrls[currentPage - 1]);
      setIsRenderingPage(false);
      return;
    }

    if (issue.pages && issue.pages[currentPage - 1] && issue.pages[currentPage - 1].imageUrl) {
      setRenderedPdfPage(issue.pages[currentPage - 1].imageUrl);
      setIsRenderingPage(false);
      return;
    }

    if (!issue.pdfUrl || issue.pdfUrl === '#' || typeof window === 'undefined' || !window.pdfjsLib) {
      setRenderedPdfPage(null);
      setIsRenderingPage(false);
      return;
    }

    setIsRenderingPage(true);
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    window.pdfjsLib.getDocument(issue.pdfUrl).promise.then(async (pdfDoc) => {
      if (currentPage > pdfDoc.numPages) {
        if (isMounted) setIsRenderingPage(false);
        return;
      }

      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      if (isMounted) {
        setRenderedPdfPage(canvas.toDataURL('image/jpeg', 0.85));
        setIsRenderingPage(false);
      }
    }).catch(err => {
      console.warn('PDF page rendering fallback:', err);
      if (isMounted) {
        setRenderedPdfPage(null);
        setIsRenderingPage(false);
      }
    });

    return () => { isMounted = false; };
  }, [issue, currentPage]);

  const activePageData = issue.pages && issue.pages.find(p => p.page === currentPage);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container edergi-reader-container" onClick={(e) => e.stopPropagation()}>
        {/* READER TOPBAR */}
        <div className="edergi-reader-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={20} color="#38bdf8" />
            <div>
              <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>PİKAM DİJİTAL E-DERGİ</span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '8px' }}>
                {issue.issueNumber} - {issue.monthYear}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#334155', padding: '4px 10px', borderRadius: '4px', fontSize: '0.82rem' }}>
              <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.4 : 1, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ChevronLeft size={16} />
              </button>

              <span>Sayfa {currentPage} / {totalPages}</span>

              <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.4 : 1, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            <button 
              onClick={() => setZoomLevel(zoomLevel === 100 ? 125 : 100)} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}
              title="Sayfayı Yakınlaştır"
            >
              <ZoomIn size={16} />
              <span>%{zoomLevel}</span>
            </button>

            <button 
              onClick={handleDownloadPdf}
              className="top-search-btn" 
              style={{ background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '4px', fontWeight: '700', fontSize: '0.82rem' }}
              title="Tüm PDF Dergiyi İndir"
            >
              <Download size={15} />
              <span>Tüm PDF'i İndir</span>
            </button>

            <button className="modal-close-btn" style={{ position: 'relative', top: 0, right: 0 }} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* READER VIEWPORT */}
        <div className="edergi-viewport">
          <div 
            className="edergi-page-sheet" 
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transition: 'transform 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '620px',
              padding: '16px'
            }}
          >
            {isRenderingPage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '480px', color: '#0284c7' }}>
                <Loader2 size={36} className="animate-spin" />
                <span style={{ marginTop: '12px', fontWeight: '700', fontSize: '0.95rem' }}>Yüklediğiniz PDF'in Sayfası Oluşturuluyor (Sayfa {currentPage})...</span>
              </div>
            ) : renderedPdfPage ? (
              <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img 
                  src={renderedPdfPage} 
                  alt={`Sayfa ${currentPage}`} 
                  style={{ maxWidth: '100%', maxHeight: '580px', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }} 
                />
              </div>
            ) : currentPage === 1 ? (
              <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <img src={issue.coverImage} alt={issue.monthYear} style={{ maxHeight: '440px', borderRadius: '4px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', marginTop: '16px', color: '#0f172a' }}>
                  PİKAM DERGİ - {issue.monthYear} SAYISI
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Kapak Teması: {issue.theme}</p>
              </div>
            ) : (
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '8px', marginBottom: '20px' }}>
                  <span style={{ fontFamily: 'Playfair Display', fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>
                    PİKAM DERGİ | {issue.monthYear}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>SAYFA {currentPage}</span>
                </div>

                <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', color: '#0b132b', marginBottom: '12px' }}>
                  {activePageData ? activePageData.title : `Bölüm ${currentPage}: Küresel Analiz ve Doktrinler`}
                </h2>

                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#334155', marginBottom: '16px' }}>
                  {activePageData ? activePageData.content : `Bu sayfada PİKAM Stratejik Araştırmalar Masası tarafından derlenen ${issue.theme} konusundaki ampirik grafikler, haritalar ve akademik kurul değerlendirmeleri yer almaktadır.`}
                </p>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #1c2541', marginTop: '20px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>Dipnot & Kaynakça:</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    PİKAM 2026/Q2 Küresel İktisat Raporu Veri Seti v4.2. Uluslararası Para Fonu (IMF) ve Dünya Bankası Doğu Akdeniz Enerji Projeksiyonları.
                  </p>
                </div>
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Politik ve İktisadi Araştırmalar Merkezi Dijital Yayınları</span>
              <span>Sayfa {currentPage} / {totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
