import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, BookOpen, Layers } from 'lucide-react';

export default function EDergiModal({ issue, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!issue) return null;

  const totalPages = issue.pageCount || 68;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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
              <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ opacity: currentPage === 1 ? 0.4 : 1, color: 'white' }}>
                <ChevronLeft size={16} />
              </button>

              <span>Sayfa {currentPage} / {totalPages}</span>

              <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ opacity: currentPage === totalPages ? 0.4 : 1, color: 'white' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            <button 
              onClick={() => setZoomLevel(zoomLevel === 100 ? 125 : 100)} 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1', fontSize: '0.8rem' }}
              title="Sayfayı Yakınlaştır"
            >
              <ZoomIn size={16} />
              <span>%{zoomLevel}</span>
            </button>

            <a 
              href={issue.coverImage} 
              download={`PIKAM-Dergi-${issue.monthYear.replace(' ', '-')}.pdf`}
              className="top-search-btn" 
              style={{ background: '#2563eb', color: 'white' }}
              onClick={(e) => {
                alert(`"${issue.monthYear} (${issue.issueNumber})" dijital nüshası PDF formatında indiriliyor...`);
              }}
            >
              <Download size={14} />
              <span>PDF İndir</span>
            </a>

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
              justifyContent: 'space-between'
            }}
          >
            {currentPage === 1 ? (
              <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <img src={issue.coverImage} alt={issue.monthYear} style={{ maxHeight: '420px', borderRadius: '4px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' }} />
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', marginTop: '16px', color: '#0f172a' }}>
                  PİKAM DERGİ - {issue.monthYear} SAYISI
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Kapak Teması: {issue.theme}</p>
              </div>
            ) : (
              <div>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '20px', fontSize: '0.75rem', color: '#94a3b8' }}>
              <span>Politik ve İktisadi Araştırmalar Merkezi Dijital Yayınları</span>
              <span>Sayfa {currentPage}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
