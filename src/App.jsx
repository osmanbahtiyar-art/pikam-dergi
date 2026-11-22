import React, { useState, useEffect, useCallback } from 'react';
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

import { SITE_DEFAULTS } from './data/defaults';
import { supabase } from './lib/supabaseClient';
import * as db from './lib/db';

// TopBar şu an kullanılmıyor; import, ileride yeniden eklenebilmesi için duruyor.
void TopBar;

const isAdminPath = () => /^\/admin\/?$/i.test(window.location.pathname) || /^#\/?admin$/i.test(window.location.hash);

const moveItem = (list, index, delta) => {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

function PasswordResetModal({ onDone }) {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) setMsg(error.message);
    else onDone();
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,19,43,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <form onSubmit={submit} style={{ background: '#fff', borderRadius: 10, padding: 24, width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem' }}>Yeni Şifre Belirleyin</h2>
        {msg && <div style={{ color: '#b91c1c', fontSize: '0.85rem' }}>{msg}</div>}
        <input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="En az 6 karakter" autoComplete="new-password" style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1' }} />
        <button type="submit" style={{ background: '#0b132b', color: '#fff', padding: 12, border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Şifreyi Kaydet</button>
      </form>
    </div>
  );
}

export default function App() {
  const [isAdmin] = useState(isAdminPath);
  const [activeCategory, setActiveCategory] = useState('ANASAYFA');

  // Modallar
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedEDergi, setSelectedEDergi] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isKunyeOpen, setIsKunyeOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Site içeriği (Supabase'den gelir; yoksa varsayılanlar)
  const [content, setContent] = useState(SITE_DEFAULTS);
  const [saveError, setSaveError] = useState('');

  // Okur hesapları, yorumlar, admin verileri
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [isRecovering, setIsRecovering] = useState(false);

  // ---------- İlk yükleme ----------
  useEffect(() => {
    db.loadContent()
      .then((cloud) => setContent((prev) => ({ ...prev, ...cloud })))
      .catch((err) => console.error('İçerik yüklenemedi:', err));
    db.loadComments()
      .then(setComments)
      .catch((err) => console.error('Yorumlar yüklenemedi:', err));
  }, []);

  // ---------- Oturum takibi ----------
  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setCurrentUser(db.profileFromSession(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(db.profileFromSession(session));
      if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---------- Admin verileri (yalnızca /admin) ----------
  const refreshAdminData = useCallback(async () => {
    const [p, s, c] = await Promise.allSettled([db.loadProfiles(), db.loadSubscribers(), db.loadComments()]);
    if (p.status === 'fulfilled') setProfiles(p.value);
    if (s.status === 'fulfilled') setSubscribers(s.value);
    if (c.status === 'fulfilled') setComments(c.value);
  }, []);

  // ---------- Kaydetme ----------
  const save = useCallback(async (key, value) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    try {
      await db.saveContent(key, value);
      setSaveError('');
      return true;
    } catch (err) {
      console.error(`"${key}" kaydedilemedi:`, err);
      setSaveError(`Değişiklik kaydedilemedi (${key}): ${err.message}. Sayfayı yenileyip tekrar deneyin.`);
      return false;
    }
  }, []);

  const { articles, authors, issues, hero, sections, nav, kunye, header, footer, notes } = content;

  // ---------- Yazı bağlantıları (/yazi-id) ----------
  const handleOpenArticle = (art) => {
    setSelectedArticle(art);
    if (art?.id) window.history.pushState({ articleId: art.id }, '', `/${art.id}`);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.history.pushState(null, '', '/');
  };

  useEffect(() => {
    if (isAdmin) return undefined;
    const syncFromUrl = () => {
      const id = window.location.pathname.replace(/^\//, '').trim() || new URLSearchParams(window.location.search).get('article');
      const found = id && articles.find((a) => String(a.id).toLowerCase() === id.toLowerCase());
      setSelectedArticle(found || null);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [articles, isAdmin]);

  // ---------- Yorumlar ----------
  const handleAddComment = async (c) => {
    try {
      const saved = await db.addComment({
        articleId: c.articleId,
        articleTitle: c.articleTitle,
        authorName: currentUser?.fullName || c.authorName,
        commentText: c.commentText,
      });
      setComments((prev) => [saved, ...prev]);
    } catch (err) {
      console.error('Yorum eklenemedi:', err);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await db.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setSaveError(`Yorum silinemedi: ${err.message}`);
    }
  };

  // ---------- Bülten ----------
  const handleSubscribeNewsletter = async (email) => {
    if (!email || !email.includes('@')) return false;
    try {
      await db.subscribeNewsletter(email);
      return true;
    } catch (err) {
      console.error('Bülten kaydı başarısız:', err);
      return false;
    }
  };

  const handleDeleteSubscriber = async (id) => {
    try {
      await db.deleteSubscriber(id);
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setSaveError(`Abone silinemedi: ${err.message}`);
    }
  };

  // ---------- Üyeler ----------
  const handleDeleteUser = async (id) => {
    try {
      await db.deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setSaveError(`Üye silinemedi: ${err.message}`);
    }
  };

  const handleLogoutUser = async () => {
    await db.signOut();
    setCurrentUser(null);
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  // ---------- Yönetim paneli ----------
  if (isAdmin) {
    return (
      <>
        {saveError && (
          <div
            role="alert"
            style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: '#b91c1c', color: '#fff', padding: '10px 16px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', gap: 12 }}
          >
            <span>{saveError}</span>
            <button onClick={() => setSaveError('')} style={{ background: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: 4, cursor: 'pointer' }}>
              Kapat
            </button>
          </div>
        )}
        <AdminPanel
          onAdminReady={refreshAdminData}
          eDergiList={issues}
          onAddEDergi={(issue) => save('issues', [issue, ...issues])}
          onUpdateEDergi={(issue) => save('issues', issues.map((i) => (i.id === issue.id ? issue : i)))}
          onToggleHideEDergi={(id) => save('issues', issues.map((i) => (i.id === id ? { ...i, hidden: !i.hidden } : i)))}
          onMoveEDergiUp={(idx) => save('issues', moveItem(issues, idx, -1))}
          onMoveEDergiDown={(idx) => save('issues', moveItem(issues, idx, 1))}
          onDeleteEDergi={(id) => save('issues', issues.filter((i) => i.id !== id))}
          articlesList={articles}
          onAddArticle={(art) => save('articles', [art, ...articles])}
          onUpdateArticle={(art) => save('articles', articles.map((a) => (a.id === art.id ? art : a)))}
          onToggleHideArticle={(id) => save('articles', articles.map((a) => (a.id === id ? { ...a, hidden: !a.hidden } : a)))}
          onMoveArticleUp={(idx) => save('articles', moveItem(articles, idx, -1))}
          onMoveArticleDown={(idx) => save('articles', moveItem(articles, idx, 1))}
          onDeleteArticle={(id) => save('articles', articles.filter((a) => a.id !== id))}
          registeredUsersList={profiles}
          onDeleteUser={handleDeleteUser}
          authorsList={authors}
          onAddAuthor={(a) => save('authors', [a, ...authors])}
          onUpdateAuthor={(a) => save('authors', authors.map((x) => (x.id === a.id ? a : x)))}
          onDeleteAuthor={(id) => save('authors', authors.filter((a) => a.id !== id))}
          onMoveAuthorUp={(idx) => save('authors', moveItem(authors, idx, -1))}
          onMoveAuthorDown={(idx) => save('authors', moveItem(authors, idx, 1))}
          heroFeatured={hero}
          onUpdateHeroFeatured={(h) => save('hero', h)}
          sectionVisibility={sections}
          onToggleSection={(key) => save('sections', { ...sections, [key]: !sections[key] })}
          navVisibility={nav}
          onToggleNavTab={(key) => save('nav', { ...nav, [key]: !nav[key] })}
          kunyeData={kunye}
          onUpdateKunye={(k) => save('kunye', k)}
          allCommentsList={comments}
          onDeleteComment={handleDeleteComment}
          adminNotesList={notes}
          onAddNote={(n) => save('notes', [n, ...notes])}
          onUpdateNote={(n) => save('notes', notes.map((x) => (x.id === n.id ? n : x)))}
          onToggleCompleteNote={(id) => save('notes', notes.map((x) => (x.id === id ? { ...x, isCompleted: !x.isCompleted } : x)))}
          onDeleteNote={(id) => save('notes', notes.filter((x) => x.id !== id))}
          headerData={header}
          onUpdateHeaderData={(h) => save('header', h)}
          footerData={footer}
          onUpdateFooterData={(f) => save('footer', f)}
          newsletterSubscribers={subscribers}
          onDeleteSubscriber={handleDeleteSubscriber}
          onRefresh={refreshAdminData}
        />
      </>
    );
  }

  // ---------- Site ----------
  return (
    <div className="app-root">
      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onOpenKunye={() => setIsKunyeOpen(true)}
        onScrollToEDergi={() => scrollTo('e-dergi-section')}
        onScrollToYazarlar={() => scrollTo('yazarlar-section')}
        navVisibility={nav}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogoutUser={handleLogoutUser}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <Header headerData={header} sectionVisibility={sections} />

      {sections.showTicker && <Ticker onSelectArticle={handleOpenArticle} />}

      <main>
        {sections.showEDergi && (
          <EDergiSection id="e-dergi-section" eDergiList={issues} onOpenEDergiModal={setSelectedEDergi} />
        )}

        {sections.showHero && <HeroGrid heroFeatured={hero} onSelectArticle={handleOpenArticle} />}

        {sections.showEditorialFeed !== false && (
          <EditorialFeed activeCategory={activeCategory} articlesList={articles} onSelectArticle={handleOpenArticle} />
        )}

        {sections.showYazarlar && <YazarlarSection id="yazarlar-section" authorsList={authors} />}
      </main>

      <Footer
        onSelectCategory={setActiveCategory}
        onOpenKunye={() => setIsKunyeOpen(true)}
        onScrollToEDergi={() => scrollTo('e-dergi-section')}
        footerData={footer}
        headerData={header}
        sectionVisibility={sections}
        onSubscribeNewsletter={handleSubscribeNewsletter}
      />

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          currentUser={currentUser}
          allCommentsList={comments}
          onAddComment={handleAddComment}
          onOpenAuthModal={() => {
            handleCloseArticle();
            setIsAuthModalOpen(true);
          }}
          onClose={handleCloseArticle}
        />
      )}

      {selectedEDergi && <EDergiModal issue={selectedEDergi} onClose={() => setSelectedEDergi(null)} />}

      {isSearchOpen && (
        <SearchModal
          articlesList={articles}
          eDergiList={issues}
          authorsList={authors}
          onClose={() => setIsSearchOpen(false)}
          onSelectArticle={handleOpenArticle}
          onSelectEDergi={setSelectedEDergi}
        />
      )}

      {isKunyeOpen && <KunyeModal onClose={() => setIsKunyeOpen(false)} kunyeData={kunye} />}

      {isRecovering && <PasswordResetModal onDone={() => setIsRecovering(false)} />}

      {isAuthModalOpen && (
        <UserAuthModal onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={(user) => setCurrentUser(user)} />
      )}
    </div>
  );
}
