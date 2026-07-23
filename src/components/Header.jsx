import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
        <img 
          src="/pikam_logo.png" 
          alt="PİKAM Amblem" 
          style={{ width: '85px', height: '85px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}
        />

        <div style={{ textAlignment: 'left' }}>
          <h1 className="logo-title" style={{ textAlign: 'left' }}>{PIKAM_DATA.header.title}</h1>
          <div className="logo-subtitle" style={{ textAlign: 'left' }}>{PIKAM_DATA.header.fullTitle}</div>
          <div className="logo-tagline" style={{ textAlign: 'left' }}>{PIKAM_DATA.header.tagline}</div>
          <div className="logo-issn" style={{ textAlign: 'left', maxWidth: '100%' }}>{PIKAM_DATA.header.issn}</div>
        </div>
      </div>
    </header>
  );
}
