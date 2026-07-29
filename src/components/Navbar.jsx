import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';

export default function Navbar({ activeCategory, onSelectCategory, onOpenKunye, onScrollToEDergi, onScrollToYazarlar, navVisibility = {} }) {
  const handleClick = (catId) => {
    if (catId === 'ANASAYFA') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onSelectCategory('ANASAYFA');
    } else if (catId === 'KÜNYE') {
      onOpenKunye();
    } else if (catId === 'E-DERGİ') {
      onScrollToEDergi();
    } else if (catId === 'YAZARLAR' || catId === 'EKİBİMİZ') {
      onScrollToYazarlar();
    } else {
      onSelectCategory(catId);
    }
  };

  const visibleCategories = PIKAM_DATA.categories.filter((cat) => {
    if (navVisibility && navVisibility[cat.id] === false) {
      return false;
    }
    return true;
  });

  return (
    <nav className="main-nav">
      <div className="container nav-inner">
        <ul className="nav-menu">
          {visibleCategories.map((cat) => (
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
