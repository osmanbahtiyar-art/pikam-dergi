import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <a href="https://www.pikamtr.com/" target="_blank" rel="noreferrer" title="PİKAM Ana Web Sitesine Git (pikamtr.com)">
          <img 
            src="/pikam_logo.png" 
            alt="PİKAM Amblem" 
            style={{ width: '85px', height: '85px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', cursor: 'pointer' }}
          />
        </a>

        <div style={{ textAlignment: 'left' }}>
          <h1 className="logo-title" style={{ textAlign: 'left' }}>{PIKAM_DATA.header.title}</h1>
          <div className="logo-subtitle" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{PIKAM_DATA.header.fullTitle}</span>
            <a 
              href="https://www.pikamtr.com/" 
              target="_blank" 
              rel="noreferrer" 
              style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: '700', textTransform: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={11} /> pikamtr.com
            </a>
          </div>
          <div className="logo-tagline" style={{ textAlign: 'left' }}>{PIKAM_DATA.header.tagline}</div>
          <div className="logo-issn" style={{ textAlign: 'left', maxWidth: '100%' }}>{PIKAM_DATA.header.issn}</div>
        </div>
      </div>
    </header>
  );
}
