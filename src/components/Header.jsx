import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { ExternalLink } from 'lucide-react';

export default function Header({ headerData, sectionVisibility = {} }) {
  if (sectionVisibility.showSiteHeader === false || (headerData && headerData.showSiteHeader === false)) {
    return null;
  }

  const hData = headerData || {
    emblemUrl: '/pikam_blue_emblem.png',
    logotypeUrl: '/pikam_blue_logotype.png',
    showEmblem: true,
    showLogotype: true,
    title: 'PİKAM DERGİ',
    fullTitle: 'Politik ve İktisadi Araştırmalar Merkezi',
    tagline: 'Küresel Jeopolitik, İktisadi Stratejiler ve Politika Analizleri',
    issn: 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026',
    portalUrl: 'https://www.pikamtr.com/',
    portalLabel: 'pikamtr.com'
  };

  return (
    <header className="site-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '22px 0 18px 0' }}>
      <div className="container header-brand-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* LOGO 1: Modern Blue 'P' Emblem Icon */}
        {hData.showEmblem !== false && (
          <a href={hData.portalUrl || "https://www.pikamtr.com/"} target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={hData.emblemUrl || "/pikam_blue_emblem.png"} 
              alt="PİKAM Amblem" 
              className="header-logo-img"
              style={{ width: '90px', height: '90px', objectFit: 'contain', transition: 'transform 0.3s ease' }}
            />
          </a>
        )}

        {/* LOGO 2: Official Corporate Typography Logotype & Info Block */}
        <div className="header-text-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {hData.showLogotype !== false && hData.logotypeUrl ? (
            <a href={hData.portalUrl || "https://www.pikamtr.com/"} target="_blank" rel="noreferrer">
              <img 
                src={hData.logotypeUrl} 
                alt="PİKAM Logotype" 
                style={{ maxHeight: '80px', width: 'auto', objectFit: 'contain', marginBottom: '6px' }}
              />
            </a>
          ) : (
            <div>
              <h1 className="logo-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', margin: 0, color: '#0b132b' }}>{hData.title || 'PİKAM DERGİ'}</h1>
              <div className="logo-subtitle" style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>{hData.fullTitle}</div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <a 
              href={hData.portalUrl || "https://www.pikamtr.com/"} 
              target="_blank" 
              rel="noreferrer" 
              className="pikam-portal-badge"
              style={{ padding: '4px 14px', fontSize: '0.8rem', background: '#0284c7', color: 'white', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
            >
              <ExternalLink size={13} /> {hData.portalLabel || 'pikamtr.com'}
            </a>
            {hData.issn && <span className="logo-issn" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{hData.issn}</span>}
          </div>

          {hData.tagline && (
            <div className="logo-tagline" style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600', marginTop: '6px' }}>
              {hData.tagline}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
