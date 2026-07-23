import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Clock, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HeroGrid({ onSelectArticle }) {
  const hero = PIKAM_DATA.heroFeatured;

  return (
    <section className="hero-section">
      <div className="container hero-grid">
        {/* MAIN HERO CARD */}
        <div className="hero-main-card" onClick={() => onSelectArticle(hero)}>
          <div className="hero-image-wrapper">
            <img src={hero.image} alt={hero.title} className="hero-image" />
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <span className="category-tag" style={{ backgroundColor: hero.categoryColor }}>
                {hero.category}
              </span>
            </div>
          </div>

          <div className="hero-content">
            <h2 className="hero-title">{hero.title}</h2>
            <p className="hero-subtitle">{hero.subtitle}</p>

            <div className="author-meta">
              <img src={hero.author.avatar} alt={hero.author.name} className="author-avatar" />
              <div className="author-info">
                <span className="author-name">{hero.author.name}</span>
                <span className="author-role">{hero.author.title}</span>
              </div>

              <div className="meta-right">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {hero.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#10b981', fontWeight: '600' }}>
                  <Clock size={12} /> {hero.readTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECONDARY FEATURED SIDEBAR & ANA SİTEYE GEÇİŞ BUTONU */}
        <div className="hero-sidebar">
          {/* PİKAMTR.COM ÖZEL GEÇİŞ BANNERI */}
          <div style={{ background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)', color: 'white', padding: '18px', borderRadius: '8px', border: '1px solid #0284c7', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
              <ShieldCheck size={16} />
              <span>PİKAM ANA MERKEZİ PORTALI</span>
            </div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '1.05rem', fontWeight: '700', margin: '8px 0 4px 0', color: '#ffffff' }}>
              Politik ve İktisadi Araştırmalar Merkezi
            </div>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.4 }}>
              Merkezin tüm kurumsal raporları, veri setleri ve akademik etkinlikleri için ana portalı ziyaret edebilirsiniz.
            </p>
            <a 
              href="https://www.pikamtr.com/" 
              target="_blank" 
              rel="noreferrer" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: '#0284c7',
                color: '#ffffff',
                padding: '10px 14px',
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <span>pikamtr.com Portalı'na Geçiş Yap</span>
              <ExternalLink size={15} />
            </a>
          </div>

          <div style={{ borderBottom: '2px solid #0b132b', paddingBottom: '6px', margin: '12px 0 8px 0' }}>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.15rem', color: '#0b132b', fontWeight: '800' }}>
              ÖNE ÇIKAN DİĞER ANALİZLER
            </h3>
          </div>

          {PIKAM_DATA.secondaryFeatured.map((sec) => (
            <div key={sec.id} className="sec-card" onClick={() => onSelectArticle(sec)}>
              <img src={sec.image} alt={sec.title} className="sec-img" />
              <div className="sec-content">
                <div>
                  <span className="category-tag" style={{ backgroundColor: sec.categoryColor, fontSize: '0.65rem', padding: '2px 6px', marginBottom: '4px' }}>
                    {sec.category}
                  </span>
                  <h4 className="sec-title">{sec.title}</h4>
                </div>
                <div className="sec-meta">
                  <span>{sec.author} • {sec.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
