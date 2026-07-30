import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { BookOpen, Eye } from 'lucide-react';

export default function EDergiSection({ id, eDergiList, onOpenEDergiModal }) {
  const issuesToDisplay = (eDergiList || PIKAM_DATA.eDergiIssues).filter(i => !i.hidden);
  const fallbackCover = '/pikam_kapak_temmuz_1784839785714.jpg';

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

        <div className="e-dergi-carousel">
          {issuesToDisplay.map((issue) => {
            const coverUrl = (issue.coverImage && !issue.coverImage.startsWith('blob:')) ? issue.coverImage : fallbackCover;
            return (
              <div 
                key={issue.id} 
                className="e-dergi-card"
                onClick={() => onOpenEDergiModal(issue)}
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
                    <span>DİJİTAL SAYIYI OKU</span>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>({issue.pageCount} Sayfa PDF)</span>
                  </div>
                </div>

                <div className="e-dergi-info">
                  <div className="e-dergi-issue">{issue.issueNumber}</div>
                  <div className="e-dergi-month">{issue.monthYear}</div>
                  <div className="e-dergi-theme">"{issue.theme}"</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
