import React, { useState } from 'react';
import TopBar from './components/TopBar';
import Header from './components/Header';
import Navbar from './components/Navbar';
import Ticker from './components/Ticker';
import HeroGrid from './components/HeroGrid';
import EditorialFeed from './components/EditorialFeed';
import YazarlarSection from './components/YazarlarSection';
import EDergiSection from './components/EDergiSection';
import Footer from './components/Footer';

import ArticleModal from './components/ArticleModal';
import EDergiModal from './components/EDergiModal';
import SearchModal from './components/SearchModal';
import KunyeModal from './components/KunyeModal';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('TÜMÜ');
  
  // Modals state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedEDergi, setSelectedEDergi] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKunyeOpen, setIsKunyeOpen] = useState(false);

  const scrollToEDergi = () => {
    const el = document.getElementById('e-dergi-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToYazarlar = () => {
    const el = document.getElementById('yazarlar-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-root">
      <TopBar 
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenKunye={() => setIsKunyeOpen(true)}
      />

      <Header />

      <Navbar 
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenKunye={() => setIsKunyeOpen(true)}
        onScrollToEDergi={scrollToEDergi}
        onScrollToYazarlar={scrollToYazarlar}
      />

      <Ticker 
        onSelectArticle={(art) => setSelectedArticle(art)}
      />

      <main>
        {activeCategory === 'TÜMÜ' && (
          <HeroGrid 
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        )}

        <EditorialFeed 
          activeCategory={activeCategory}
          onSelectArticle={(art) => setSelectedArticle(art)}
        />

        <YazarlarSection 
          id="yazarlar-section"
        />

        <EDergiSection 
          id="e-dergi-section"
          onOpenEDergiModal={(issue) => setSelectedEDergi(issue)}
        />
      </main>

      <Footer 
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenKunye={() => setIsKunyeOpen(true)}
        onScrollToEDergi={scrollToEDergi}
      />

      {/* MODAL OVERLAYS */}
      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

      {selectedEDergi && (
        <EDergiModal 
          issue={selectedEDergi}
          onClose={() => setSelectedEDergi(null)}
        />
      )}

      {isSearchOpen && (
        <SearchModal 
          onClose={() => setIsSearchOpen(false)}
          onSelectArticle={(art) => setSelectedArticle(art)}
        />
      )}

      {isKunyeOpen && (
        <KunyeModal 
          onClose={() => setIsKunyeOpen(false)}
        />
      )}
    </div>
  );
}
