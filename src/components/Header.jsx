import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-brand">
        <h1 className="logo-title">{PIKAM_DATA.header.title}</h1>
        <div className="logo-subtitle">{PIKAM_DATA.header.fullTitle}</div>
        <div className="logo-tagline">{PIKAM_DATA.header.tagline}</div>
        <div className="logo-issn">{PIKAM_DATA.header.issn}</div>
      </div>
    </header>
  );
}
