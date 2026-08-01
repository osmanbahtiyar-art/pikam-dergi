import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-brand header-brand-inner" style={{ flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
        {/* LOGO 1: Modern Blue 'P' Emblem Icon */}
        <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/pikam_blue_emblem.png" 
            alt="PİKAM Kurumsal Amblem" 
            className="header-logo-img"
            style={{ width: '85px', height: '85px', objectFit: 'contain' }}
          />
        </a>

        {/* LOGO 2: Official Corporate Typography Logotype & Info Block */}
        <div className="header-text-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)">
            <img 
              src="/pikam_blue_logotype.png" 
              alt="PİKAM Politik ve İktisadi Araştırma Merkezi" 
              style={{ maxHeight: '72px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }}
            />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '2px' }}>
            <a 
              href="https://www.pikamtr.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="pikam-portal-badge"
              style={{ padding: '4px 14px', fontSize: '0.8rem', background: '#0284c7', color: 'white', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700' }}
            >
              <ExternalLink size={13} /> pikamtr.com
            </a>
            <span className="logo-issn" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{PIKAM_DATA.header.issn}</span>
          </div>

          <div className="logo-tagline" style={{ fontSize: '0.88rem', color: '#334155', fontWeight: '600', marginTop: '6px' }}>
            {PIKAM_DATA.header.tagline}
          </div>
        </div>
      </div>
    </header>
  );
}
