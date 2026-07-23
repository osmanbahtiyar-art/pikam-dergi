import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Feather, ArrowRight } from 'lucide-react';

export default function YazarlarSection({ id, onSelectAuthor }) {
  return (
    <section className="yazarlar-bg" id={id}>
      <div className="container">
        <div className="section-header" style={{ borderBottomColor: '#38bdf8' }}>
          <div className="section-title" style={{ color: '#ffffff' }}>
            <Feather size={22} color="#38bdf8" />
            <span>PİKAM YAZARLARI & AKADEMİK KADRO</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Düşünce Kuruluşu Kıdemli Analistleri
          </span>
        </div>

        <div className="yazarlar-grid">
          {PIKAM_DATA.authors.map((author) => (
            <div key={author.id} className="yazar-card" onClick={() => onSelectAuthor && onSelectAuthor(author)}>
              <img src={author.avatar} alt={author.name} className="yazar-avatar" />
              <h4 className="yazar-name">{author.name}</h4>
              <p className="yazar-role">{author.role}</p>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600', textTransform: 'uppercase' }}>
                {author.affiliation}
              </div>
              <div className="yazar-latest">
                "{author.latestArticle}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
