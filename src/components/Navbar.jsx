import React from 'react';
import { PIKAM_DATA } from '../data/pikamData';
import { Search, User, LogOut } from 'lucide-react';

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

  const visibleCategories = PIKAM_DATA.categories.filter((cat) => !(navVisibility && navVisibility[cat.id] === false));

  return (
    <nav className="main-nav pk-nav" aria-label="Ana menü">
      <div className="container pk-nav-inner">
        <ul className="nav-menu pk-nav-menu">
          {visibleCategories.map((cat) => (
            <li className="nav-item" key={cat.id}>
              <button
                type="button"
                className={`nav-link ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleClick(cat.id)}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="pk-nav-actions">
          <button type="button" className="top-search-btn pk-icon-btn" onClick={onOpenSearch} aria-label="Sitede ara">
            <Search size={15} />
            <span className="pk-btn-label">Sitede Ara...</span>
          </button>

          {currentUser ? (
            <div className="pk-user-chip">
              <User size={14} />
              <span className="pk-btn-label pk-user-name">{currentUser.fullName}</span>
              <button type="button" onClick={onLogoutUser} className="pk-logout" title="Çıkış Yap" aria-label="Çıkış yap">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button type="button" className="top-auth-btn pk-icon-btn pk-auth" onClick={onOpenAuthModal} aria-label="Giriş yap veya üye ol">
              <User size={15} />
              <span className="pk-btn-label">Giriş Yap / Üye Ol</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
