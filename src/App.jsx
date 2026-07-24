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
import UserAuthModal from './components/UserAuthModal';
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Current Logged In User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pikam_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Registered Users List State (Persisted in Supabase & localStorage)
  const [registeredUsersList, setRegisteredUsersList] = useState(() => {
    const saved = localStorage.getItem('pikam_registered_users');
    return saved ? JSON.parse(saved) : [
      {
        id: 'usr-demo-1',
        fullName: 'Prof. Dr. Ahmet Yılmaz',
        email: 'ahmet.yilmaz@pikam.org',
        phone: '0532 111 22 33',
        interests: 'EKONOMİ, STRATEJİ',
        registeredAt: '24.07.2026 14:15:20'
      },
      {
        id: 'usr-demo-2',
        fullName: 'Sera Erdağı',
        email: 'sera.erdagi@pikamtr.com',
        phone: '0555 444 55 66',
        interests: 'POLİTİKA, DÜNYA',
        registeredAt: '24.07.2026 16:40:12'
      }
    ];
  });

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
    // Fetch Cloud Users, Issues and Articles from Supabase if available
    const fetchCloudData = async () => {
      try {
        const { data: cloudProfiles } = await supabase.from('profiles').select('*');
        if (cloudProfiles && cloudProfiles.length > 0) {
          const mapped = cloudProfiles.map(p => ({
            id: p.id,
            fullName: p.full_name,
            email: p.email,
            phone: p.phone,
            interests: p.interests,
            registeredAt: p.registered_at
          }));
          setRegisteredUsersList(mapped);
          localStorage.setItem('pikam_registered_users', JSON.stringify(mapped));
        }

        const { data: cloudIssues } = await supabase.from('e_dergi_issues').select('*');
        if (cloudIssues && cloudIssues.length > 0) {
          const cloudIds = new Set(cloudIssues.map(i => i.id));
          const filteredDefaults = PIKAM_DATA.eDergiIssues.filter(i => !cloudIds.has(i.id));
          const merged = [...cloudIssues, ...filteredDefaults];
          setEDergiList(merged);
          localStorage.setItem('pikam_edergi_list', JSON.stringify(merged));
        }

        const { data: cloudArticles } = await supabase.from('articles').select('*');
        if (cloudArticles && cloudArticles.length > 0) {
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

    // Check Admin Route
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

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    // Reload registered users list from localStorage
    const saved = localStorage.getItem('pikam_registered_users');
    if (saved) {
      setRegisteredUsersList(JSON.parse(saved));
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('pikam_current_user');
  };

  const handleDeleteUser = (userId) => {
    const updated = registeredUsersList.filter(u => u.id !== userId);
    setRegisteredUsersList(updated);
    localStorage.setItem('pikam_registered_users', JSON.stringify(updated));
  };

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
        registeredUsersList={registeredUsersList}
        onDeleteUser={handleDeleteUser}
      />
    );
  }

  // MAIN WEBSITE INTERFACE
  return (
    <div className="app-root">
      <TopBar 
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogoutUser={handleLogoutUser}
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
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setSelectedArticle(null);
            setIsAuthModalOpen(true);
          }}
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

      {isAuthModalOpen && (
        <UserAuthModal 
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
