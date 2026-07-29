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
  const [activeCategory, setActiveCategory] = useState('ANASAYFA');
  
  // Modals state
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedEDergi, setSelectedEDergi] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKunyeOpen, setIsKunyeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Section Visibility Toggles (Hide/Show sections from Admin Panel)
  const [sectionVisibility, setSectionVisibility] = useState(() => {
    const saved = localStorage.getItem('pikam_section_visibility');
    return saved ? JSON.parse(saved) : {
      showHero: true,
      showYazarlar: true,
      showEDergi: true,
      showTicker: true
    };
  });

  // Current Logged In User State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pikam_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Registered Users List State
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

  // Dynamic Authors List (Manageable via Admin Panel)
  const [authorsList, setAuthorsList] = useState(() => {
    const saved = localStorage.getItem('pikam_authors_list');
    return saved ? JSON.parse(saved) : PIKAM_DATA.authors;
  });

  // Dynamic Homepage Hero Main Story CMS State
  const [heroFeatured, setHeroFeatured] = useState(() => {
    const saved = localStorage.getItem('pikam_hero_featured');
    return saved ? JSON.parse(saved) : PIKAM_DATA.heroFeatured;
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

  // Article Reader Comments State (Permanent Storage)
  const [allCommentsList, setAllCommentsList] = useState(() => {
    const saved = localStorage.getItem('pikam_article_comments');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        // 1. Fetch Registered Users Profiles with Cumulative Merging
        const { data: cloudProfiles } = await supabase.from('profiles').select('*');
        const localSaved = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
        
        let mergedUsers = [];
        if (cloudProfiles && cloudProfiles.length > 0) {
          mergedUsers = cloudProfiles.map(p => ({
            id: p.id,
            fullName: p.full_name || p.fullName,
            email: p.email,
            phone: p.phone,
            interests: p.interests,
            registeredAt: p.registered_at || p.registeredAt
          }));
        }

        if (localSaved && localSaved.length > 0) {
          localSaved.forEach(lu => {
            if (!mergedUsers.some(mu => (mu.email && lu.email && mu.email.toLowerCase() === lu.email.toLowerCase()) || mu.id === lu.id)) {
              mergedUsers.push(lu);
              try {
                supabase.from('profiles').upsert([{
                  id: lu.id,
                  full_name: lu.fullName,
                  fullName: lu.fullName,
                  email: lu.email,
                  phone: lu.phone,
                  interests: lu.interests,
                  registered_at: lu.registeredAt,
                  registeredAt: lu.registeredAt
                }]);
              } catch (err) {
                console.log('Local user cloud push notice:', err);
              }
            }
          });
        }

        if (mergedUsers.length > 0) {
          setRegisteredUsersList(mergedUsers);
          localStorage.setItem('pikam_registered_users', JSON.stringify(mergedUsers));
        }

        // 2. Fetch Reader Comments
        const { data: cloudComments } = await supabase.from('article_comments').select('*');
        const localComments = JSON.parse(localStorage.getItem('pikam_article_comments') || '[]');
        let mergedComments = [];

        if (cloudComments && cloudComments.length > 0) {
          mergedComments = cloudComments.map(c => ({
            id: c.id,
            articleId: c.article_id || c.articleId,
            articleTitle: c.article_title || c.articleTitle,
            authorName: c.author_name || c.authorName,
            authorEmail: c.author_email || c.authorEmail,
            commentText: c.comment_text || c.commentText,
            createdAt: c.created_at || c.createdAt
          }));
        }

        if (localComments && localComments.length > 0) {
          localComments.forEach(lc => {
            if (!mergedComments.some(mc => mc.id === lc.id)) {
              mergedComments.push(lc);
            }
          });
        }

        if (mergedComments.length > 0) {
          setAllCommentsList(mergedComments);
          localStorage.setItem('pikam_article_comments', JSON.stringify(mergedComments));
        }

        // 3. Fetch Authors List
        const { data: cloudAuthors } = await supabase.from('authors').select('*');
        if (cloudAuthors && cloudAuthors.length > 0) {
          setAuthorsList(cloudAuthors);
          localStorage.setItem('pikam_authors_list', JSON.stringify(cloudAuthors));
        }

        // 4. Fetch Site Settings
        const { data: cloudSettings } = await supabase.from('site_settings').select('*');
        if (cloudSettings && cloudSettings.length > 0) {
          const heroSetting = cloudSettings.find(s => s.id === 'hero_featured');
          if (heroSetting && heroSetting.data) {
            setHeroFeatured(heroSetting.data);
            localStorage.setItem('pikam_hero_featured', JSON.stringify(heroSetting.data));
          }

          const visibilitySetting = cloudSettings.find(s => s.id === 'section_visibility');
          if (visibilitySetting && visibilitySetting.data) {
            setSectionVisibility(visibilitySetting.data);
            localStorage.setItem('pikam_section_visibility', JSON.stringify(visibilitySetting.data));
          }
        }

        // 5. Fetch E-Dergi Issues
        const { data: cloudIssues } = await supabase.from('e_dergi_issues').select('*');
        if (cloudIssues && cloudIssues.length > 0) {
          const cloudIds = new Set(cloudIssues.map(i => i.id));
          const filteredDefaults = PIKAM_DATA.eDergiIssues.filter(i => !cloudIds.has(i.id));
          const merged = [...cloudIssues, ...filteredDefaults];
          setEDergiList(merged);
          localStorage.setItem('pikam_edergi_list', JSON.stringify(merged));
        }

        // 6. Fetch Articles List
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

  const handleAddComment = async (newComment) => {
    const updated = [newComment, ...allCommentsList];
    setAllCommentsList(updated);
    localStorage.setItem('pikam_article_comments', JSON.stringify(updated));

    try {
      await supabase.from('article_comments').upsert([{
        id: newComment.id,
        article_id: newComment.articleId,
        article_title: newComment.articleTitle,
        author_name: newComment.authorName,
        author_email: newComment.authorEmail,
        comment_text: newComment.commentText,
        created_at: newComment.createdAt
      }]);
    } catch (err) {
      console.log('Supabase comment add notice:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const updated = allCommentsList.filter(c => c.id !== commentId);
    setAllCommentsList(updated);
    localStorage.setItem('pikam_article_comments', JSON.stringify(updated));

    try {
      await supabase.from('article_comments').delete().eq('id', commentId);
    } catch (err) {
      console.log('Supabase comment delete notice:', err);
    }
  };

  const handleToggleSection = async (sectionKey) => {
    const updated = {
      ...sectionVisibility,
      [sectionKey]: !sectionVisibility[sectionKey]
    };
    setSectionVisibility(updated);
    localStorage.setItem('pikam_section_visibility', JSON.stringify(updated));

    try {
      await supabase.from('site_settings').upsert([{ id: 'section_visibility', data: updated }]);
    } catch (err) {
      console.log('Supabase visibility sync notice:', err);
    }
  };

  const handleUpdateHeroFeatured = async (updatedHero) => {
    setHeroFeatured(updatedHero);
    localStorage.setItem('pikam_hero_featured', JSON.stringify(updatedHero));

    try {
      await supabase.from('site_settings').upsert([{ id: 'hero_featured', data: updatedHero }]);
    } catch (err) {
      console.log('Supabase hero sync notice:', err);
    }
  };

  const handleAddAuthor = async (newAuthor) => {
    const updated = [newAuthor, ...authorsList];
    setAuthorsList(updated);
    localStorage.setItem('pikam_authors_list', JSON.stringify(updated));

    try {
      await supabase.from('authors').upsert([newAuthor]);
    } catch (err) {
      console.log('Supabase author add notice:', err);
    }
  };

  const handleUpdateAuthor = async (updatedAuthor) => {
    const updated = authorsList.map(a => a.id === updatedAuthor.id ? updatedAuthor : a);
    setAuthorsList(updated);
    localStorage.setItem('pikam_authors_list', JSON.stringify(updated));

    try {
      await supabase.from('authors').upsert([updatedAuthor]);
    } catch (err) {
      console.log('Supabase author update notice:', err);
    }
  };

  const handleDeleteAuthor = async (authorId) => {
    const updated = authorsList.filter(a => a.id !== authorId);
    setAuthorsList(updated);
    localStorage.setItem('pikam_authors_list', JSON.stringify(updated));

    try {
      await supabase.from('authors').delete().eq('id', authorId);
    } catch (err) {
      console.log('Supabase author delete notice:', err);
    }
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    try {
      const { data: cloudProfiles } = await supabase.from('profiles').select('*');
      const localSaved = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
      let mergedUsers = [];
      if (cloudProfiles && cloudProfiles.length > 0) {
        mergedUsers = cloudProfiles.map(p => ({
          id: p.id,
          fullName: p.full_name || p.fullName,
          email: p.email,
          phone: p.phone,
          interests: p.interests,
          registeredAt: p.registered_at || p.registeredAt
        }));
      }
      localSaved.forEach(lu => {
        if (!mergedUsers.some(mu => (mu.email && lu.email && mu.email.toLowerCase() === lu.email.toLowerCase()) || mu.id === lu.id)) {
          mergedUsers.push(lu);
        }
      });
      setRegisteredUsersList(mergedUsers);
      localStorage.setItem('pikam_registered_users', JSON.stringify(mergedUsers));
    } catch (err) {
      console.log('Login success user refresh notice:', err);
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('pikam_current_user');
  };

  const handleDeleteUser = async (userId) => {
    const updated = registeredUsersList.filter(u => u.id !== userId);
    setRegisteredUsersList(updated);
    localStorage.setItem('pikam_registered_users', JSON.stringify(updated));

    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch (err) {
      console.log('Supabase profile delete notice:', err);
    }
  };

  const handleAddEDergi = async (newIssue) => {
    const updated = [newIssue, ...eDergiList];
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));

    try {
      await supabase.from('e_dergi_issues').upsert([newIssue]);
    } catch (err) {
      console.log('Supabase edergi add notice:', err);
    }
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

  const handleAddArticle = async (newArticle) => {
    const updated = [newArticle, ...articlesList];
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').upsert([newArticle]);
    } catch (err) {
      console.log('Supabase article add notice:', err);
    }
  };

  const handleUpdateArticle = async (updatedArticle) => {
    const updated = articlesList.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').upsert([updatedArticle]);
    } catch (err) {
      console.log('Supabase article update notice:', err);
    }
  };

  const handleToggleHideArticle = async (articleId) => {
    const updated = articlesList.map(a => {
      if (a.id === articleId) {
        const newArt = { ...a, hidden: !a.hidden };
        try {
          supabase.from('articles').upsert([newArt]);
        } catch (err) {}
        return newArt;
      }
      return a;
    });
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));
  };

  const handleMoveArticleUp = (index) => {
    if (index === 0) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));
  };

  const handleMoveArticleDown = (index) => {
    if (index === articlesList.length - 1) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));
  };

  const handleDeleteArticle = async (id) => {
    const updated = articlesList.filter(a => a.id !== id);
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').delete().eq('id', id);
    } catch (err) {
      console.log('Supabase article delete notice:', err);
    }
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
        onUpdateArticle={handleUpdateArticle}
        onToggleHideArticle={handleToggleHideArticle}
        onMoveArticleUp={handleMoveArticleUp}
        onMoveArticleDown={handleMoveArticleDown}
        articlesList={articlesList}
        onDeleteArticle={handleDeleteArticle}
        registeredUsersList={registeredUsersList}
        onDeleteUser={handleDeleteUser}
        authorsList={authorsList}
        onAddAuthor={handleAddAuthor}
        onDeleteAuthor={handleDeleteAuthor}
        onUpdateAuthor={handleUpdateAuthor}
        heroFeatured={heroFeatured}
        onUpdateHeroFeatured={handleUpdateHeroFeatured}
        sectionVisibility={sectionVisibility}
        onToggleSection={handleToggleSection}
        allCommentsList={allCommentsList}
        onDeleteComment={handleDeleteComment}
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

      {sectionVisibility.showTicker && (
        <Ticker 
          onSelectArticle={(art) => setSelectedArticle(art)}
        />
      )}

      <main>
        {sectionVisibility.showHero && (
          <HeroGrid 
            heroFeatured={heroFeatured}
            onSelectArticle={(art) => setSelectedArticle(art)}
          />
        )}

        <EditorialFeed 
          activeCategory={activeCategory}
          articlesList={articlesList}
          onSelectArticle={(art) => setSelectedArticle(art)}
        />

        {sectionVisibility.showYazarlar && (
          <YazarlarSection 
            id="yazarlar-section"
            authorsList={authorsList}
          />
        )}

        {sectionVisibility.showEDergi && (
          <EDergiSection 
            id="e-dergi-section"
            eDergiList={eDergiList}
            onOpenEDergiModal={(issue) => setSelectedEDergi(issue)}
          />
        )}
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
          allCommentsList={allCommentsList}
          onAddComment={handleAddComment}
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
