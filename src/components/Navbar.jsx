import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';

export default function Navbar({ activeCategory, onSelectCategory, onOpenKunye, onScrollToEDergi, onScrollToYazarlar }) {
  const handleClick = (catId) => {
    if (catId === 'KÜNYE') {
      onOpenKunye();
    } else if (catId === 'E-DERGİ') {
      onScrollToEDergi();
    } else if (catId === 'YAZARLAR') {
      onScrollToYazarlar();
    } else {
      onSelectCategory(catId);
    }
  };

  return (
    <nav className="main-nav">
      <div className="container nav-inner">
        <ul className="nav-menu">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeCategory === 'TÜMÜ' ? 'active' : ''}`}
              onClick={() => handleClick('TÜMÜ')}
            >
              ANASAYFA
            </button>
          </li>
          {PIKAM_DATA.categories.filter(c => c.id !== 'TÜMÜ').map((cat) => (
            <li className="nav-item" key={cat.id}>
              <button
                className={`nav-link ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleClick(cat.id)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
