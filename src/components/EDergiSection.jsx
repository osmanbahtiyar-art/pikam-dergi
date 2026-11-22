import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { BookOpen, Download } from 'lucide-react';

const FALLBACK_COVER = '/pikam_kapak_temmuz_1784839785714.jpg';

const coverOf = (issue) => issue.coverImage || issue.coverimage || FALLBACK_COVER;

const fileNameOf = (issue) =>
  issue.pdfFileName || `PIKAM-Dergi-${(issue.issueNumber || 'sayi').replace(/\s+/g, '-')}.pdf`;

const hasPdf = (issue) => issue.pdfUrl && issue.pdfUrl !== '#';

function DownloadButton({ issue, className }) {
  if (!hasPdf(issue)) return null;
  return (
    <a
      className={className}
      href={issue.pdfUrl}
      download={fileNameOf(issue)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      <Download size={16} />
      <span>PDF İndir</span>
    </a>
  );
}

export default function EDergiSection({ id, eDergiList, onOpenEDergiModal }) {
  const issues = (eDergiList || PIKAM_DATA.eDergiIssues).filter((i) => !i.hidden);
  if (issues.length === 0) return null;

  const [latest, ...older] = issues;

  return (
    <section className="e-dergi-section edg" id={id}>
      <div className="container">
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div className="section-title">
            <BookOpen size={22} color="#0b132b" />
            <span>PİKAM DERGİ</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            {issues.length} sayı yayımlandı
          </span>
        </div>

        {/* Son sayı: pikamtr.com/dergi düzeni — solda tanıtım, sağda tam kapak */}
        <div className="edg-feature">
          <div className="edg-feature-text">
            <img src="/pikam_blue_logotype.png" alt="PİKAM" className="edg-logotype" />
            <div className="edg-kicker">
              {[latest.issueNumber, latest.monthYear].filter(Boolean).join(' · ')}
            </div>
            <h3 className="edg-title">PİKAM Dergi</h3>
            <p className="edg-lead">{latest.editorNote || latest.theme}</p>
            {latest.editorNote && latest.theme && <p className="edg-theme">“{latest.theme}”</p>}
            <div className="edg-actions">
              <button type="button" className="edg-btn edg-btn-primary" onClick={() => onOpenEDergiModal(latest)}>
                <BookOpen size={16} />
                <span>Dergiyi Oku</span>
              </button>
              <DownloadButton issue={latest} className="edg-btn edg-btn-secondary" />
            </div>
            {latest.pageCount ? <div className="edg-meta">{latest.pageCount} sayfa · PDF</div> : null}
          </div>

          <button type="button" className="edg-cover-btn" onClick={() => onOpenEDergiModal(latest)} aria-label={`${latest.issueNumber} sayısını oku`}>
            <img
              src={coverOf(latest)}
              alt={`PİKAM Dergi ${latest.issueNumber || ''} kapağı`}
              className="edg-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_COVER;
              }}
            />
          </button>
        </div>

        {/* Önceki sayılar */}
        {older.length > 0 && (
          <>
            <h4 className="edg-archive-title">Önceki Sayılar</h4>
            <div className="edg-archive">
              {older.map((issue) => (
                <button type="button" key={issue.id} className="edg-archive-card" onClick={() => onOpenEDergiModal(issue)}>
                  <img src={coverOf(issue)} alt={`${issue.issueNumber} kapağı`} className="edg-archive-cover" />
                  <span className="edg-archive-issue">{issue.issueNumber}</span>
                  <span className="edg-archive-month">{issue.monthYear}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
