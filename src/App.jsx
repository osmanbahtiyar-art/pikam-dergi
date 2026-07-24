import React, { useState, useEffect } from 'react';
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
import AdminPanel from './components/AdminPanel';

import { PIKAM_DATA } from './data/pikamData';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('TÜMÜ');
  
  // Modals state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedEDergi, setSelectedEDergi] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKunyeOpen, setIsKunyeOpen] = useState(false);

  // Dynamic E-Dergi & Articles state with Supabase & localStorage persistence
  const [eDergiList, setEDergiList] = useState(() => {
    const saved = localStorage.getItem('pikam_edergi_list');
    return saved ? JSON.parse(saved) : PIKAM_DATA.eDergiIssues;
  });

  const [articlesList, setArticlesList] = useState(() => {
    const saved = localStorage.getItem('pikam_articles_list');
    return saved ? JSON.parse(saved) : PIKAM_DATA.articles;
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Fetch Cloud Issues and Articles from Supabase if available
    const fetchCloudData = async () => {
      try {
        const { data: cloudIssues, error: issueErr } = await supabase.from('e_dergi_issues').select('*');
        if (!issueErr && cloudIssues && cloudIssues.length > 0) {
          const cloudIds = new Set(cloudIssues.map(i => i.id));
          const filteredDefaults = PIKAM_DATA.eDergiIssues.filter(i => !cloudIds.has(i.id));
          const merged = [...cloudIssues, ...filteredDefaults];
          setEDergiList(merged);
          localStorage.setItem('pikam_edergi_list', JSON.stringify(merged));
        }

        const { data: cloudArticles, error: artErr } = await supabase.from('articles').select('*');
        if (!artErr && cloudArticles && cloudArticles.length > 0) {
          const cloudArtIds = new Set(cloudArticles.map(a => a.id));
          const filteredArtDefaults = PIKAM_DATA.articles.filter(a => !cloudArtIds.has(a.id));
          const mergedArts = [...cloudArticles, ...filteredArtDefaults];
          setArticlesList(mergedArts);
          localStorage.setItem('pikam_articles_list', JSON.stringify(mergedArts));
        }
      } catch (err) {
        console.log('Supabase cloud fetch notice:', err);
      }
    };

    fetchCloudData();

    // 2. Check Admin Route
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Save to localStorage and state
  const handleAddEDergi = (newIssue) => {
    const updated = [newIssue, ...eDergiList];
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));
  };

  const handleDeleteEDergi = async (id) => {
    const updated = eDergiList.filter(i => i.id !== id);
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));
    try {
      await supabase.from('e_dergi_issues').delete().eq('id', id);
    } catch (err) {
      console.log('Supabase delete sync:', err);
    }
  };

  const handleAddArticle = (newArticle) => {
    const updated = [newArticle, ...articlesList];
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));
  };

  const scrollToEDergi = () => {
    const el = document.getElementById('e-dergi-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToYazarlar = () => {
    const el = document.getElementById('yazarlar-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // RENDER ADMIN PANEL IF ADMIN ROUTE DETECTED
  if (isAdmin) {
    return (
      <AdminPanel 
        eDergiList={eDergiList}
        onAddEDergi={handleAddEDergi}
        onDeleteEDergi={handleDeleteEDergi}
        onAddArticle={handleAddArticle}
        articlesList={articlesList}
      />
    );
  }

  // MAIN WEBSITE INTERFACE
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
          articlesList={articlesList}
          onSelectArticle={(art) => setSelectedArticle(art)}
        />

        <YazarlarSection 
          id="yazarlar-section"
        />

        <EDergiSection 
          id="e-dergi-section"
          eDergiList={eDergiList}
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
