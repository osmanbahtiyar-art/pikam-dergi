import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '22px 0 18px 0' }}>
      <div className="container header-brand-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        {/* LOGO 1: Modern Blue 'P' Emblem Icon */}
        <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/pikam_blue_emblem.png" 
            alt="PİKAM Kurumsal Amblem" 
            className="header-logo-img"
            style={{ width: '90px', height: '90px', objectFit: 'contain', transition: 'transform 0.3s ease' }}
          />
        </a>

        {/* LOGO 2: Official Corporate Typography Logotype & Info Block */}
        <div className="header-text-block" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)">
            <img 
              src="/pikam_blue_logotype.png" 
              alt="PİKAM Politik ve İktisadi Araştırma Merkezi" 
              style={{ maxHeight: '80px', width: 'auto', objectFit: 'contain', marginBottom: '6px' }}
            />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
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
