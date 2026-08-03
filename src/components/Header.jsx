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
    showPortalBadge: true,
    showIssn: true,
    showTagline: true,
    title: 'PİKAM DERGİ',
    fullTitle: 'Politik ve İktisadi Araştırmalar Merkezi',
    tagline: 'Küresel Jeopolitik, İktisadi Stratejiler ve Politika Analizleri',
    issn: 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026',
    portalUrl: 'https://www.pikamtr.com/',
    portalLabel: 'pikamtr.com'
  };

  return (
    <div className="site-header" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '28px 0 24px 0' }}>
      <div className="container header-brand-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '14px', maxWidth: '900px', margin: '0 auto' }}>
        
        {/* LOGO CONTAINER (EMBLEM & LOGOTYPE CENTERED) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* LOGO 1: Modern Blue 'P' Emblem Icon */}
          {hData.showEmblem !== false && (
            <a href={hData.portalUrl || "https://www.pikamtr.com/"} target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img 
                src={hData.emblemUrl || "/pikam_blue_emblem.png"} 
                alt="PİKAM Amblem" 
                className="header-logo-img"
                style={{ width: '80px', height: '80px', objectFit: 'contain', transition: 'transform 0.3s ease' }}
              />
            </a>
          )}

          {/* LOGO 2: Official Corporate Typography Logotype */}
          {hData.showLogotype !== false && hData.logotypeUrl ? (
            <a href={hData.portalUrl || "https://www.pikamtr.com/"} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img 
                src={hData.logotypeUrl} 
                alt="PİKAM Logotype" 
                style={{ maxHeight: '75px', width: 'auto', objectFit: 'contain' }}
              />
            </a>
          ) : (
            <div>
              <h1 className="logo-title" style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', margin: 0, color: '#0b132b' }}>{hData.title || 'PİKAM DERGİ'}</h1>
              <div className="logo-subtitle" style={{ fontSize: '0.95rem', color: '#475569', fontWeight: '600' }}>{hData.fullTitle}</div>
            </div>
          )}
        </div>

        {/* INFO & TAGLINE & DESCRIPTION BLOCK */}
        <div className="header-text-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}>
          
          {/* BADGE & ISSN */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '2px' }}>
            {hData.showPortalBadge !== false && (
              <a 
                href={hData.portalUrl || "https://www.pikamtr.com/"} 
                target="_blank" 
                rel="noreferrer" 
                className="pikam-portal-badge"
                style={{ padding: '4px 14px', fontSize: '0.8rem', background: '#0284c7', color: 'white', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
              >
                <ExternalLink size={13} /> {hData.portalLabel || 'pikamtr.com'}
              </a>
            )}

            {hData.showIssn !== false && hData.issn && (
              <span className="logo-issn" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{hData.issn}</span>
            )}
          </div>

          {/* SLOGAN / MOTTO */}
          {hData.showTagline !== false && hData.tagline && (
            <div className="logo-tagline" style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '600', marginTop: '8px', fontStyle: 'italic' }}>
              {hData.tagline}
            </div>
          )}

          {/* ABOUT DESCRIPTION BOX (CENTERED & PROPORTIONAL ON PC & MOBILE) */}
          {hData.showAbout !== false && hData.aboutText && (
            <div className="logo-about" style={{ fontSize: '0.88rem', color: '#475569', fontWeight: '500', marginTop: '12px', lineHeight: '1.65', width: '100%', maxWidth: '720px', background: '#f8fafc', padding: '14px 20px', borderRadius: '8px', border: '1px solid #e2e8f0', borderTop: '3px solid #0284c7', textAlign: 'center', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              {hData.aboutText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
