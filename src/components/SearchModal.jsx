import React, { useState } from 'react';
import { X, Search, FileText, ArrowRight } from 'lucide-react';
import { PIKAM_DATA } from '../data/pikamData';

export default function SearchModal({ onClose, onSelectArticle }) {
  const [searchTerm, setSearchTerm] = useState('');

  const allArticles = [
    PIKAM_DATA.heroFeatured,
    ...PIKAM_DATA.secondaryFeatured,
    ...PIKAM_DATA.articles
  ];

  const searchResults = searchTerm.trim() === '' 
    ? [] 
    : allArticles.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (typeof item.author === 'string' ? item.author : item.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '700px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={18} />
        </button>

        <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: '#0b132b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} color="#2563eb" />
          <span>PİKAM DİJİTAL KÜTÜPHANEDE ARA</span>
        </h3>

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Makale başlığı, yazar adı veya anahtar kelime yazın... (Örn: Ekonomi, Doğu Akdeniz, Yapay Zeka)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: '6px',
              border: '2px solid #2563eb',
              fontSize: '1rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {searchTerm.trim() !== '' && (
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', fontWeight: '600' }}>
            "{searchTerm}" İÇİN BULUNAN SONUÇLAR ({searchResults.length}):
          </div>
        )}

        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {searchResults.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectArticle(item);
                onClose();
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <div>
                <span className="category-tag" style={{ backgroundColor: item.categoryColor || '#10b981', fontSize: '0.65rem', padding: '2px 6px' }}>
                  {item.category}
                </span>
                <h4 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: '#0f172a', margin: '4px 0' }}>
                  {item.title}
                </h4>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {typeof item.author === 'string' ? item.author : item.author?.name} • {item.date}
                </span>
              </div>
              <ArrowRight size={16} color="#2563eb" />
            </div>
          ))}

          {searchTerm.trim() !== '' && searchResults.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
              Aramanızla eşleşen sonuç bulunamadı. Lütfen farklı Türkçe kelimeler deneyin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
