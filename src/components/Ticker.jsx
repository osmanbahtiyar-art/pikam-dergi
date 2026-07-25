import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { TrendingUp } from 'lucide-react';

export default function Ticker({ onSelectArticle }) {
  // Duplicate ticker items to ensure infinite seamless scrolling loop
  const tickerItems = [...PIKAM_DATA.ticker, ...PIKAM_DATA.ticker, ...PIKAM_DATA.ticker];

  return (
    <div className="ticker-bar">
      <div className="container ticker-inner">
        <div className="ticker-badge">
          <TrendingUp size={13} />
          <span>SON GELİŞMELER</span>
        </div>
        
        <div className="ticker-scroll-wrapper">
          <div className="ticker-text">
            {tickerItems.map((item, idx) => (
              <span key={`${item.id}-${idx}`} onClick={() => onSelectArticle(PIKAM_DATA.heroFeatured)}>
                <strong className="ticker-cat-tag">
                  [{item.category}]
                </strong>{' '}
                <span className="ticker-title-text">{item.title}</span>
                <span className="ticker-dot">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
