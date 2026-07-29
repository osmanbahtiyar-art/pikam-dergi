import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Feather } from 'lucide-react';

export default function YazarlarSection({ id, authorsList, onSelectAuthor }) {
  const sourceAuthors = authorsList && authorsList.length > 0 ? authorsList : PIKAM_DATA.authors;
  const fallbackAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80';

  return (
    <section className="yazarlar-bg" id={id}>
      <div className="container">
        <div className="section-header" style={{ borderBottomColor: '#38bdf8' }}>
          <div className="section-title" style={{ color: '#ffffff' }}>
            <Feather size={22} color="#38bdf8" />
            <span>EKİBİMİZ & AKADEMİK KADRO</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Düşünce Kuruluşu Kıdemli Analistleri ({sourceAuthors.length} Yazar)
          </span>
        </div>

        <div className="yazarlar-grid">
          {sourceAuthors.map((author) => {
            const avatarUrl = (author.avatar && !author.avatar.startsWith('blob:')) ? author.avatar : fallbackAvatar;
            return (
              <div key={author.id} className="yazar-card" onClick={() => onSelectAuthor && onSelectAuthor(author)}>
                <img 
                  src={avatarUrl} 
                  alt={author.name} 
                  className="yazar-avatar" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = fallbackAvatar;
                  }}
                />
                <h4 className="yazar-name">{author.name}</h4>
                <p className="yazar-role">{author.role}</p>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase' }}>
                  {author.affiliation || 'PİKAM Kıdemli Analisti'}
                </div>
                {author.latestArticle && (
                  <div className="yazar-latest">
                    "{author.latestArticle}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
