import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { TrendingUp } from 'lucide-react';

export default function Ticker({ onSelectArticle }) {
  return (
    <div className="ticker-bar">
      <div className="container ticker-inner">
        <div className="ticker-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={12} />
          <span>SON GELİŞMELER & RAPORLAR</span>
        </div>
        
        <div className="ticker-text">
          {PIKAM_DATA.ticker.map((item) => (
            <span key={item.id} onClick={() => onSelectArticle(PIKAM_DATA.heroFeatured)}>
              <strong style={{ color: '#0f172a', backgroundColor: '#e2e8f0', padding: '1px 6px', borderRadius: '3px' }}>
                [{item.category}]
              </strong>{' '}
              {item.title} •
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
