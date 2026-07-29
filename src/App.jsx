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

// CLOUD MAPPERS (Bridges JavaScript camelCase with PostgreSQL lowercased columns)
const mapArticleForCloud = (art) => ({
  id: art.id,
  category: art.category,
  categorycolor: art.categoryColor || art.categorycolor || '#10b981',
  title: art.title,
  excerpt: art.excerpt,
  author: typeof art.author === 'string' ? art.author : art.author?.name,
  date: art.date,
  readtime: art.readTime || art.readtime || '6 dk',
  image: art.image,
  content: art.content,
  hidden: !!art.hidden
});

const mapArticleFromCloud = (art) => ({
  id: art.id,
  category: art.category,
  categoryColor: art.categorycolor || art.categoryColor || '#10b981',
  title: art.title,
  excerpt: art.excerpt,
  author: art.author,
  date: art.date,
  readTime: art.readtime || art.readTime || '6 dk',
  image: art.image,
  content: art.content,
  hidden: !!art.hidden
});

const mapAuthorForCloud = (auth) => ({
  id: auth.id,
  name: auth.name,
  role: auth.role,
  affiliation: auth.affiliation,
  avatar: auth.avatar,
  latestarticle: auth.latestArticle || auth.latestarticle || ''
});

const mapAuthorFromCloud = (auth) => ({
  id: auth.id,
  name: auth.name,
  role: auth.role,
  affiliation: auth.affiliation,
  avatar: auth.avatar,
  latestArticle: auth.latestarticle || auth.latestArticle || ''
});

const mapIssueForCloud = (issue) => ({
  id: issue.id,
  issuenumber: issue.issueNumber || issue.issuenumber,
  monthyear: issue.monthYear || issue.monthyear,
  theme: issue.theme,
  coverimage: issue.coverImage || issue.coverimage,
  pdfurl: issue.pdfUrl || issue.pdfurl,
  pagecount: issue.pageCount || issue.pagecount,
  pages: issue.pages
});

const mapIssueFromCloud = (issue) => ({
  id: issue.id,
  issueNumber: issue.issuenumber || issue.issueNumber,
  monthYear: issue.monthyear || issue.monthYear,
  theme: issue.theme,
  coverImage: issue.coverimage || issue.coverImage,
  pdfUrl: issue.pdfurl || issue.pdfUrl,
  pageCount: issue.pagecount || issue.pageCount,
  pages: issue.pages
});

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
    return saved ? JSON.parse(saved) : [];
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

  // CUMULATIVE MERGE & CLOUD PUSH FUNCTION
  const fetchAndMergeCloudData = async () => {
    try {
      // 1. Registered Users Profiles Cumulative Merge
      const { data: cloudProfiles } = await supabase.from('profiles').select('*');
      const localUsers = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
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
      if (localUsers && localUsers.length > 0) {
        localUsers.forEach(lu => {
          if (!mergedUsers.some(mu => (mu.email && lu.email && mu.email.toLowerCase() === lu.email.toLowerCase()) || mu.id === lu.id)) {
            mergedUsers.push(lu);
          }
        });
      }
      if (mergedUsers.length > 0) {
        setRegisteredUsersList(mergedUsers);
        localStorage.setItem('pikam_registered_users', JSON.stringify(mergedUsers));
        supabase.from('profiles').upsert(mergedUsers.map(u => ({
          id: u.id,
          full_name: u.fullName || u.full_name,
          email: u.email,
          phone: u.phone,
          interests: u.interests,
          registered_at: u.registeredAt || u.registered_at
        })));
      }

      // 2. Reader Comments Cumulative Merge
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
        supabase.from('article_comments').upsert(mergedComments.map(c => ({
          id: c.id,
          article_id: c.articleId,
          article_title: c.articleTitle,
          author_name: c.authorName,
          author_email: c.authorEmail,
          comment_text: c.commentText,
          created_at: c.createdAt
        })));
      }

      // 3. Authors List Cumulative Merge
      const { data: cloudAuthors } = await supabase.from('authors').select('*');
      const localAuthors = JSON.parse(localStorage.getItem('pikam_authors_list') || '[]');
      let mergedAuthors = [];
      if (cloudAuthors && cloudAuthors.length > 0) {
        mergedAuthors = cloudAuthors.map(mapAuthorFromCloud);
      }
      if (localAuthors && localAuthors.length > 0) {
        localAuthors.forEach(la => {
          if (!mergedAuthors.some(ma => ma.id === la.id)) {
            mergedAuthors.push(la);
          }
        });
      }
      if (mergedAuthors.length > 0) {
        setAuthorsList(mergedAuthors);
        localStorage.setItem('pikam_authors_list', JSON.stringify(mergedAuthors));
        supabase.from('authors').upsert(mergedAuthors.map(mapAuthorForCloud));
      }

      // 4. Site Settings
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

      // 5. E-Dergi Issues Cumulative Merge
      const { data: cloudIssues } = await supabase.from('e_dergi_issues').select('*');
      const localIssues = JSON.parse(localStorage.getItem('pikam_edergi_list') || '[]');
      let mergedIssues = [];
      if (cloudIssues && cloudIssues.length > 0) {
        mergedIssues = cloudIssues.map(mapIssueFromCloud);
      }
      if (localIssues && localIssues.length > 0) {
        localIssues.forEach(li => {
          if (!mergedIssues.some(mi => mi.id === li.id)) {
            mergedIssues.push(li);
          }
        });
      }
      if (mergedIssues.length > 0) {
        setEDergiList(mergedIssues);
        localStorage.setItem('pikam_edergi_list', JSON.stringify(mergedIssues));
        supabase.from('e_dergi_issues').upsert(mergedIssues.map(mapIssueForCloud));
      }

      // 6. Articles List Cumulative Merge & Push
      const { data: cloudArticles } = await supabase.from('articles').select('*');
      const localArts = JSON.parse(localStorage.getItem('pikam_articles_list') || '[]');
      let mergedArts = [];
      if (cloudArticles && cloudArticles.length > 0) {
        mergedArts = cloudArticles.map(mapArticleFromCloud);
      }
      if (localArts && localArts.length > 0) {
        localArts.forEach(la => {
          if (!mergedArts.some(ma => ma.id === la.id)) {
            mergedArts.push(la);
          }
        });
      }
      if (mergedArts.length > 0) {
        setArticlesList(mergedArts);
        localStorage.setItem('pikam_articles_list', JSON.stringify(mergedArts));
        supabase.from('articles').upsert(mergedArts.map(mapArticleForCloud));
      }
    } catch (err) {
      console.log('Supabase cumulative merge notice:', err);
    }
  };

  useEffect(() => {
    fetchAndMergeCloudData();

    // Re-fetch automatically whenever window/tab receives focus
    window.addEventListener('focus', fetchAndMergeCloudData);

    // SUPABASE REALTIME SUBSCRIPTION FOR INSTANT CROSS-DEVICE SYNC
    const channel = supabase
      .channel('pikam-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAndMergeCloudData();
      })
      .subscribe();

    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
        setIsAdmin(true);
        fetchAndMergeCloudData(); // Re-sync immediately on entering admin panel
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    return () => {
      window.removeEventListener('focus', fetchAndMergeCloudData);
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      supabase.removeChannel(channel);
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
      await supabase.from('authors').upsert([mapAuthorForCloud(newAuthor)]);
    } catch (err) {
      console.log('Supabase author add notice:', err);
    }
  };

  const handleUpdateAuthor = async (updatedAuthor) => {
    const updated = authorsList.map(a => a.id === updatedAuthor.id ? updatedAuthor : a);
    setAuthorsList(updated);
    localStorage.setItem('pikam_authors_list', JSON.stringify(updated));

    try {
      await supabase.from('authors').upsert([mapAuthorForCloud(updatedAuthor)]);
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
      if (cloudProfiles && cloudProfiles.length > 0) {
        const mappedUsers = cloudProfiles.map(p => ({
          id: p.id,
          fullName: p.full_name || p.fullName,
          email: p.email,
          phone: p.phone,
          interests: p.interests,
          registeredAt: p.registered_at || p.registeredAt
        }));
        setRegisteredUsersList(mappedUsers);
        localStorage.setItem('pikam_registered_users', JSON.stringify(mappedUsers));
      }
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
      await supabase.from('e_dergi_issues').upsert([mapIssueForCloud(newIssue)]);
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
      await supabase.from('articles').upsert([mapArticleForCloud(newArticle)]);
    } catch (err) {
      console.log('Supabase article add notice:', err);
    }
  };

  const handleUpdateArticle = async (updatedArticle) => {
    const updated = articlesList.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').upsert([mapArticleForCloud(updatedArticle)]);
    } catch (err) {
      console.log('Supabase article update notice:', err);
    }
  };

  const handleToggleHideArticle = async (articleId) => {
    const updated = articlesList.map(a => {
      if (a.id === articleId) {
        const newArt = { ...a, hidden: !a.hidden };
        try {
          supabase.from('articles').upsert([mapArticleForCloud(newArt)]);
        } catch (err) {}
        return newArt;
      }
      return a;
    });
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));
  };

  const handleMoveArticleUp = async (index) => {
    if (index === 0) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').upsert(updated.map(mapArticleForCloud));
    } catch (err) {}
  };

  const handleMoveArticleDown = async (index) => {
    if (index === articlesList.length - 1) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').upsert(updated.map(mapArticleForCloud));
    } catch (err) {}
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
        onForceSyncCloud={fetchAndMergeCloudData}
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
        {sectionVisibility.showEDergi && (
          <EDergiSection 
            id="e-dergi-section"
            eDergiList={eDergiList}
            onOpenEDergiModal={(issue) => setSelectedEDergi(issue)}
          />
        )}

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
