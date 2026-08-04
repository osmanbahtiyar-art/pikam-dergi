import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Search, FileText, User, LogOut } from 'lucide-react';

export default function Navbar({ 
  activeCategory, 
  onSelectCategory, 
  onOpenKunye, 
  onScrollToEDergi, 
  onScrollToYazarlar, 
  navVisibility = {},
  currentUser,
  onOpenAuthModal,
  onLogoutUser,
  onOpenSearch
}) {
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
    <nav className="main-nav" style={{ padding: '6px 0' }}>
      <div className="container nav-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '8px', margin: '0 auto', width: '100%' }}>
        
        {/* CENTERED CATEGORY NAVIGATION MENU */}
        <ul className="nav-menu" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '4px', margin: 0, padding: 0, width: 'auto' }}>
          {visibleCategories.map((cat) => (
            <li className="nav-item" key={cat.id}>
              <button
                className={`nav-link ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleClick(cat.id)}
                style={{ textAlign: 'center' }}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>

        {/* CENTERED TOP UTILITY ACTION BUTTONS (SİTEDE ARA, KÜNYE & KURUMSAL, GİRİŞ YAP) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', margin: '2px 0 4px 0' }}>
          <button className="top-search-btn" onClick={onOpenSearch} style={{ cursor: 'pointer' }}>
            <Search size={13} />
            <span>Sitede Ara...</span>
          </button>
          
          <button className="top-auth-btn" onClick={onOpenKunye} title="PİKAM Yayın Kurulu & Künye" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
            <FileText size={14} />
            <span>Künye & Kurumsal</span>
          </button>

          {/* USER AUTH BUTTON / PROFILE BADGE */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
              <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} /> {currentUser.fullName}
              </span>
              <button 
                onClick={onLogoutUser}
                style={{ color: '#f87171', fontSize: '0.78rem', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Çıkış Yap"
              >
                <LogOut size={12} />
              </button>
            </div>
          ) : (
            <button className="top-auth-btn" onClick={onOpenAuthModal} style={{ color: '#38bdf8', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem' }}>
              <User size={14} />
              <span>Giriş Yap / Üye Ol</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
