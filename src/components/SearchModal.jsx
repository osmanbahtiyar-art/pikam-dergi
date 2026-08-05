import React, { useState } from 'react';
import { X, Search, BookOpen, User, ArrowRight, Sparkles } from 'lucide-react';

export default function SearchModal({ 
  articlesList = [], 
  eDergiList = [], 
  authorsList = [], 
  onClose, 
  onSelectArticle,
  onSelectEDergi
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const quickTags = ['Ekonomi', 'Politika', 'Jeopolitik', 'E-Dergi', 'Finans', 'Sanat'];

  // Filter Articles
  const filteredArticles = articlesList.filter(item => {
    if (item.hidden) return false;
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase().trim();
    const titleMatch = item.title?.toLowerCase().includes(term);
    const excerptMatch = item.excerpt?.toLowerCase().includes(term);
    const categoryMatch = item.category?.toLowerCase().includes(term);
    const authorName = typeof item.author === 'string' ? item.author : item.author?.name || '';
    const authorMatch = authorName.toLowerCase().includes(term);
    return titleMatch || excerptMatch || categoryMatch || authorMatch;
  });

  // Filter E-Dergiler
  const filteredEDergi = eDergiList.filter(issue => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase().trim();
    return (
      (issue.monthYear && issue.monthYear.toLowerCase().includes(term)) ||
      (issue.theme && issue.theme.toLowerCase().includes(term)) ||
      (issue.issueNumber && String(issue.issueNumber).includes(term)) ||
      term === 'e-dergi' || term === 'dergi' || term === 'pdf'
    );
  });

  // Filter Authors
  const filteredAuthors = authorsList.filter(auth => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase().trim();
    return (
      (auth.name && auth.name.toLowerCase().includes(term)) ||
      (auth.role && auth.role.toLowerCase().includes(term)) ||
      (auth.affiliation && auth.affiliation.toLowerCase().includes(term))
    );
  });

  const totalResultsCount = filteredArticles.length + filteredEDergi.length + filteredAuthors.length;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-container" 
        style={{ maxWidth: '780px', width: '92%', padding: '28px', borderRadius: '12px', background: '#ffffff', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
        >
          <X size={18} />
        </button>

        {/* MODAL HEADER */}
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={22} color="#0284c7" />
          <span>PİKAM DİJİTAL KÜTÜPHANEDE ARA</span>
        </h3>

        {/* INPUT BOX */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Makale başlığı, yazar adı, konu veya anahtar kelime yazın... (Örn: Ekonomi, Politika)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '14px 44px 14px 18px',
              borderRadius: '8px',
              border: '2px solid #0284c7',
              fontSize: '0.96rem',
              outline: 'none',
              fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* QUICK SUGGESTION TAGS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={13} color="#0284c7" /> Popüler Aramalar:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchTerm(tag)}
              style={{
                background: searchTerm.toLowerCase() === tag.toLowerCase() ? '#0284c7' : '#f1f5f9',
                color: searchTerm.toLowerCase() === tag.toLowerCase() ? '#ffffff' : '#334155',
                border: '1px solid #cbd5e1',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* SEARCH RESULTS FEED */}
        {searchTerm.trim() !== '' && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            "{searchTerm}" İÇİN ARAMA SONUÇLARI ({totalResultsCount}):
          </div>
        )}

        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
          
          {/* 1. E-DERGİ SONUÇLARI */}
          {filteredEDergi.map((issue) => (
            <div
              key={`edergi-${issue.id}`}
              onClick={() => {
                if (onSelectEDergi) onSelectEDergi(issue);
                onClose();
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                background: '#f0f9ff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {issue.coverImage && (
                  <img src={issue.coverImage} alt={issue.theme} style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                )}
                <div>
                  <span style={{ background: '#0284c7', color: 'white', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={11} /> SAYI {issue.issueNumber} • E-DERGİ PDF
                  </span>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#0f172a', margin: '4px 0 2px 0', fontWeight: '700' }}>
                    {issue.theme} ({issue.monthYear})
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dijital Flipbook Okuyucu & PDF İndirme</span>
                </div>
              </div>
              <ArrowRight size={18} color="#0284c7" />
            </div>
          ))}

          {/* 2. MAKALELER */}
          {filteredArticles.map((art) => (
            <div
              key={`article-${art.id}`}
              onClick={() => {
                if (onSelectArticle) onSelectArticle(art);
                onClose();
              }}
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {art.image && (
                  <img src={art.image} alt={art.title} style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} />
                )}
                <div>
                  <span style={{ backgroundColor: art.categoryColor || '#10b981', color: '#ffffff', fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {art.category}
                  </span>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.98rem', color: '#0f172a', margin: '4px 0 2px 0', fontWeight: '700' }}>
                    {art.title}
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {typeof art.author === 'string' ? art.author : art.author?.name} • {art.date}
                  </span>
                </div>
              </div>
              <ArrowRight size={18} color="#0284c7" />
            </div>
          ))}

          {/* 3. YAZARLAR */}
          {filteredAuthors.map((auth) => (
            <div
              key={`author-${auth.id}`}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#faf5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {auth.avatar ? (
                  <img src={auth.avatar} alt={auth.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={24} color="#8b5cf6" />
                )}
                <div>
                  <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.98rem', color: '#0f172a', margin: '0 0 2px 0', fontWeight: '700' }}>
                    {auth.name}
                  </h4>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{auth.role || auth.affiliation}</span>
                </div>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {searchTerm.trim() !== '' && totalResultsCount === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <Search size={36} color="#cbd5e1" style={{ marginBottom: '10px' }} />
              <h4 style={{ fontSize: '1rem', color: '#334155', margin: '0 0 4px 0' }}>Sonuç Bulunamadı</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>"{searchTerm}" araması ile eşleşen makale veya dergi bulunamadı. Lütfen "Ekonomi", "Politika" veya "E-Dergi" gibi farklı kelimeler deneyin.</p>
            </div>
          )}

          {/* INITIAL STATE (WHEN SEARCH INPUT IS EMPTY) */}
          {!searchTerm.trim() && (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: '0.88rem', margin: 0 }}>
                Aradığınız konuyu, makale başlığını veya yazar adını yukarıdaki arama kutusuna yazabilirsiniz.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
