import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { BookOpen, Eye, Download } from 'lucide-react';

export default function EDergiSection({ id, eDergiList, onOpenEDergiModal }) {
  const issuesToDisplay = (eDergiList || PIKAM_DATA.eDergiIssues).filter(i => !i.hidden);
  const fallbackCover = '/pikam_kapak_temmuz_1784839785714.jpg';

  const handleDownloadPdf = (e, issue) => {
    e.stopPropagation();
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

  return (
    <section className="e-dergi-section" id={id}>
      <div className="container">
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div className="section-title">
            <BookOpen size={22} color="#0b132b" />
            <span style={{ wordBreak: 'keep-all', hyphens: 'none', whiteSpace: 'normal' }}>PİKAM DİJİTAL E-DERGİ ARŞİVİ</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b', wordBreak: 'keep-all' }}>
            Aylık İktisat ve Politika Dergisi Sayıları ({issuesToDisplay.length} Sayı)
          </span>
        </div>

        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
          PİKAM Dergi'nin yayınlanan tüm dijital sayılarına interaktif flipbook formatında erişebilir, inceleyebilir veya PDF olarak indirebilirsiniz.
        </p>

        <div className="e-dergi-grid">
          {issuesToDisplay.map((issue) => {
            const coverUrl = issue.coverImage || issue.coverimage || fallbackCover;
            const pdfUrl = issue.pdfUrl || issue.pdfurl;
            const isExternalPdf = pdfUrl && (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'));

            const handleCardClick = () => {
              if (isExternalPdf) {
                window.open(pdfUrl, '_blank');
              } else {
                onOpenEDergiModal(issue);
              }
            };

            return (
              <div 
                key={issue.id} 
                className="e-dergi-card"
                onClick={handleCardClick}
                style={{ cursor: 'pointer' }}
                title={`${issue.monthYear} - Google Drive'da Oku / İndir`}
              >
                <div className="e-dergi-cover-wrap">
                  <img 
                    src={coverUrl} 
                    alt={issue.monthYear} 
                    className="e-dergi-cover" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackCover;
                    }}
                  />
                  <div className="e-dergi-overlay">
                    <Eye size={28} />
                    <span>{isExternalPdf ? 'DRIVE\'DA OKU / İNDİR ↗' : 'DİJİTAL SAYIYI OKU'}</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({issue.pageCount || 'PDF'} Sayfa)</span>
                  </div>
                </div>

                <div className="e-dergi-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="e-dergi-issue">{issue.issueNumber}</div>
                    <div className="e-dergi-month">{issue.monthYear}</div>
                    <div className="e-dergi-theme">"{issue.theme}"</div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pdfUrl && pdfUrl !== '#') {
                        window.open(pdfUrl, '_blank');
                      } else {
                        alert('Dergi PDF / Google Drive bağlantısı henüz yüklenmemiştir.');
                      }
                    }}
                    style={{ marginTop: '12px', background: '#0284c7', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <Download size={14} color="#ffffff" />
                    <span>{isExternalPdf ? 'Drive\'da İndir / Oku ↗' : 'PDF İndir'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
