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

          {/* TAKİP EDİN: INTEGRATED SOCIAL MEDIA BAR */}
          {hData.showSocials !== false && (
            <div className="header-socials-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '10px', background: '#f1f5f9', padding: '6px 18px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: '700', letterSpacing: '0.5px' }}>TAKİP EDİN:</span>
              
              {hData.linkedinUrl && (
                <a href={hData.linkedinUrl} target="_blank" rel="noreferrer" className="header-social-icon" title="LinkedIn" style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
              )}

              {hData.twitterUrl && (
                <a href={hData.twitterUrl} target="_blank" rel="noreferrer" className="header-social-icon" title="X (Twitter)" style={{ color: '#0f172a', display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}

              {hData.instagramUrl && (
                <a href={hData.instagramUrl} target="_blank" rel="noreferrer" className="header-social-icon" title="Instagram" style={{ color: '#e11d48', display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}

              {hData.youtubeUrl && (
                <a href={hData.youtubeUrl} target="_blank" rel="noreferrer" className="header-social-icon" title="YouTube" style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
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
