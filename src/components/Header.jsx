import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-brand header-brand-inner">
        <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)">
          <img 
            src="/pikam_logo.png" 
            alt="PİKAM Amblem" 
            className="header-logo-img"
          />
        </a>

        <div className="header-text-block">
          <h1 className="logo-title">{PIKAM_DATA.header.title}</h1>
          <div className="logo-subtitle">
            {PIKAM_DATA.header.fullTitle}
          </div>
          <div style={{ marginTop: '6px', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>
            <a 
              href="https://www.pikamtr.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="pikam-portal-badge"
              style={{ padding: '3px 12px', fontSize: '0.78rem' }}
            >
              <ExternalLink size={12} /> pikamtr.com
            </a>
          </div>
          <div className="logo-tagline">{PIKAM_DATA.header.tagline}</div>
          <div className="logo-issn">{PIKAM_DATA.header.issn}</div>
        </div>
      </div>
    </header>
  );
}
