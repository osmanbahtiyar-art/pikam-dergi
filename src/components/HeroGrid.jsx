import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

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

        {/* SECONDARY FEATURED SIDEBAR */}
        <div className="hero-sidebar">
          <div style={{ borderBottom: '2px solid #0b132b', paddingBottom: '6px', marginBottom: '8px' }}>
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

          <div style={{ background: '#1c2541', color: 'white', padding: '16px', borderRadius: '6px', marginTop: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
              AKADEMİK YAYIN ÇAĞRISI
            </div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '1.05rem', fontWeight: '700', margin: '6px 0' }}>
              PİKAM 2026 Güz Dönemi Hakemli Makale Kabulü Başladı
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
              Uluslararası ilişkiler, makroekonomi ve strateji alanındaki akademik çalışmalarınızı dergi sistemimize yükleyebilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
