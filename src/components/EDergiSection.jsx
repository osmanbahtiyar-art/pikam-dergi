import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { BookOpen, Eye, Download, Calendar } from 'lucide-react';

export default function EDergiSection({ id, onOpenEDergiModal }) {
  return (
    <section className="e-dergi-section" id={id}>
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <BookOpen size={22} color="#0b132b" />
            <span>PİKAM DİJİTAL E-DERGİ ARŞİVİ</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Aylık İktisat ve Politika Dergisi Sayıları
          </span>
        </div>

        <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '20px' }}>
          PİKAM Dergi'nin yayınlanan tüm dijital sayılarına interaktif flipbook formatında erişebilir, inceleyebilir veya PDF olarak indirebilirsiniz.
        </p>

        <div className="e-dergi-carousel">
          {PIKAM_DATA.eDergiIssues.map((issue) => (
            <div 
              key={issue.id} 
              className="e-dergi-card"
              onClick={() => onOpenEDergiModal(issue)}
            >
              <div className="e-dergi-cover-wrap">
                <img src={issue.coverImage} alt={issue.monthYear} className="e-dergi-cover" />
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
          ))}
        </div>
      </div>
    </section>
  );
}
