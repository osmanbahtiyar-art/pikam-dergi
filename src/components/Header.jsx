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
            <span>{PIKAM_DATA.header.fullTitle}</span>
            <a 
              href="https://www.pikamtr.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="pikam-portal-badge"
            >
              <ExternalLink size={11} /> pikamtr.com
            </a>
          </div>
          <div className="logo-tagline">{PIKAM_DATA.header.tagline}</div>
          <div className="logo-issn">{PIKAM_DATA.header.issn}</div>
        </div>
      </div>
    </header>
  );
}
