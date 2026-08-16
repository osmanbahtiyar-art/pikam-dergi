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
  content: art.content
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

  // Navigation Menu Tabs Visibility State (Admin CMS toggle - categories hidden by default as requested)
  const [navVisibility, setNavVisibility] = useState(() => {
    const saved = localStorage.getItem('pikam_nav_visibility');
    return saved ? JSON.parse(saved) : {
      ANASAYFA: true,
      'E-DERGİ': true,
      POLİTİKA: false, // hidden as requested
      EKONOMİ: false,  // hidden as requested
      FİNANS: false,   // hidden as requested
      'KÜLTÜR SANAT': false, // hidden as requested
      KÜNYE: true,
      EKİBİMİZ: true
    };
  });

  // Dynamic Künye & Kurumsal Data CMS State
  const [kunyeData, setKunyeData] = useState(() => {
    const saved = localStorage.getItem('pikam_kunye_data');
    return saved ? JSON.parse(saved) : {
      yayinSahibi: PIKAM_DATA.kunye.yayinSahibi,
      yayinYonetmeni: PIKAM_DATA.kunye.yayinYonetmeni,
      sorumluYaziIsleri: PIKAM_DATA.kunye.sorumluYaziIsleri,
      grafikTasarim: PIKAM_DATA.kunye.grafikTasarim,
      akademikDanismaKurulu: PIKAM_DATA.kunye.akademikDanismaKurulu,
      iletisim: PIKAM_DATA.kunye.iletisim
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

  // Admin Notes & Todo List State (Permanent Cloud & Local Persistence)
  const [adminNotesList, setAdminNotesList] = useState(() => {
    const saved = localStorage.getItem('pikam_admin_notes');
    return saved ? JSON.parse(saved) : [
      {
        id: 'note-1',
        title: 'E-Dergi Çapraz Cihaz Kontrolü',
        content: 'Yüklenen tüm PDF dergilerin iOS Safari ve Android Chrome mobil cihazlarda kesintisiz açıldığının düzenli kontrolü.',
        category: 'Yapılacaklar',
        priority: 'Yüksek',
        isCompleted: false,
        createdAt: '31 Temmuz 2026'
      }
    ];
  });

  // Dynamic Header & Footer CMS State
  const [headerData, setHeaderData] = useState(() => {
    const saved = localStorage.getItem('pikam_header_data');
    return saved ? JSON.parse(saved) : {
      showSiteHeader: true,
      emblemUrl: '/pikam_blue_emblem.png',
      logotypeUrl: '/pikam_blue_logotype.png',
      showEmblem: true,
      showLogotype: true,
      showPortalBadge: true,
      showIssn: true,
      showTagline: true,
      showAbout: true,
      showSocials: true,
      linkedinUrl: 'https://linkedin.com',
      twitterUrl: 'https://x.com',
      instagramUrl: 'https://instagram.com',
      youtubeUrl: 'https://youtube.com',
      title: 'PİKAM DERGİ',
      fullTitle: 'Politik ve İktisadi Araştırmalar Merkezi',
      tagline: 'Türkiye\'nin politik ve iktisadi geleceğine yön veren düşünce merkezi.',
      aboutText: 'PİKAM Dergi; Politik ve İktisadi Araştırmalar Merkezi bünyesinde yayınlanan, küresel jeopolitik, iktisadi stratejiler ve kamu politikaları alanında bağımsız ve akademik analizler sunan dijital yayın organıdır.',
      issn: 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026',
      portalUrl: 'https://www.pikamtr.com/',
      portalLabel: 'pikamtr.com'
    };
  });

  const [footerData, setFooterData] = useState(() => {
    const saved = localStorage.getItem('pikam_footer_data');
    return saved ? JSON.parse(saved) : {
      showSiteFooter: true,
      logoUrl: '/pikam_logo.png',
      title: 'PİKAM DERGİ',
      description: 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.',
      portalUrl: 'https://www.pikamtr.com/',
      portalLabel: 'Merkez Portalı: www.pikamtr.com',
      issnText: 'ISSN: 2717-9842 | Ankara, Türkiye',
      copyrightText: '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.'
    };
  });

  // Newsletter Subscribers State
  const [newsletterSubscribers, setNewsletterSubscribers] = useState(() => {
    const saved = localStorage.getItem('pikam_newsletter_subscribers');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const lastFetchTimeRef = React.useRef(0);

  // REAL-TIME INSTANT SYNCHRONIZATION FUNCTION (SUPABASE CLOUD AS SINGLE SOURCE OF TRUTH)
  const fetchAndMergeCloudData = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTimeRef.current < 4000) {
      return; // Skip rapid non-forced queries within 4s
    }
    lastFetchTimeRef.current = now;
    try {
      // 1. Registered Users / Profiles
      const { data: cloudProfiles } = await supabase.from('profiles').select('*');
      if (cloudProfiles) {
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

      // 2. Reader Comments (Deletions in Admin Panel reflect instantly on all devices)
      const { data: cloudComments } = await supabase.from('article_comments').select('*');
      if (cloudComments && cloudComments.length > 0) {
        const mappedComments = cloudComments.map(c => ({
          id: c.id,
          articleId: c.article_id || c.articleId,
          articleTitle: c.article_title || c.articleTitle,
          authorName: c.author_name || c.authorName,
          authorEmail: c.author_email || c.authorEmail,
          commentText: c.comment_text || c.commentText,
          createdAt: c.created_at || c.createdAt
        }));
        setAllCommentsList(mappedComments);
        localStorage.setItem('pikam_article_comments', JSON.stringify(mappedComments));
      }

      // 2.5 Master Merged Registered Users (Combines state, local storage, Supabase profiles, & site_settings so no user ever flickers or disappears)
      const localUsers = JSON.parse(localStorage.getItem('pikam_registered_users') || '[]');
      const userMap = new Map();
      
      // Preserve currently rendered users in state
      if (Array.isArray(registeredUsersList)) {
        registeredUsersList.forEach(u => u && u.email && userMap.set(u.email.trim().toLowerCase(), u));
      }

      // Add local storage users
      localUsers.forEach(u => u && u.email && userMap.set(u.email.trim().toLowerCase(), u));

      try {
        const { data: cloudProfiles } = await supabase.from('profiles').select('*');
        if (cloudProfiles && cloudProfiles.length > 0) {
          cloudProfiles.forEach(p => {
            if (p && p.email) {
              const key = p.email.trim().toLowerCase();
              const existing = userMap.get(key) || {};
              userMap.set(key, {
                id: p.id || existing.id || `usr-${Date.now()}`,
                fullName: p.full_name || existing.fullName || 'PİKAM Okuru',
                email: p.email,
                password: p.password || existing.password || '',
                phone: p.phone || existing.phone || '',
                interests: p.interests || existing.interests || 'POLİTİKA, EKONOMİ',
                registeredAt: p.registered_at || existing.registeredAt || new Date().toLocaleDateString('tr-TR')
              });
            }
          });
        }
      } catch (profErr) {
        console.log('Supabase profiles sync notice:', profErr);
      }

      // 3. Authors List (Uses exact locked order from site_settings merged with all cloud authors)
      const { data: cloudAuthors } = await supabase.from('authors').select('*');

      // 4. Site Settings (Hero, Visibility, Nav, Künye, Authors Order, Admin Notes)
      const { data: cloudSettings } = await supabase.from('site_settings').select('*');
      if (cloudSettings && cloudSettings.length > 0) {
        const authorsOrderSetting = cloudSettings.find(s => s.id === 'authors_ordered_list');
        if (cloudAuthors && cloudAuthors.length > 0) {
          const mappedAuthors = cloudAuthors.map(mapAuthorFromCloud);
          if (authorsOrderSetting && Array.isArray(authorsOrderSetting.data) && authorsOrderSetting.data.length > 0) {
            const orderedIds = new Set(authorsOrderSetting.data.map(a => a.id));
            const missingCloudAuthors = mappedAuthors.filter(a => !orderedIds.has(a.id));
            const mergedList = [...authorsOrderSetting.data, ...missingCloudAuthors];
            setAuthorsList(mergedList);
            localStorage.setItem('pikam_authors_list', JSON.stringify(mergedList));
          } else {
            setAuthorsList(mappedAuthors);
            localStorage.setItem('pikam_authors_list', JSON.stringify(mappedAuthors));
          }
        }

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

        const navSetting = cloudSettings.find(s => s.id === 'nav_visibility');
        if (navSetting && navSetting.data) {
          setNavVisibility(navSetting.data);
          localStorage.setItem('pikam_nav_visibility', JSON.stringify(navSetting.data));
        }

        const kunyeSetting = cloudSettings.find(s => s.id === 'kunye_data');
        if (kunyeSetting && kunyeSetting.data) {
          setKunyeData(kunyeSetting.data);
          localStorage.setItem('pikam_kunye_data', JSON.stringify(kunyeSetting.data));
        }

        const headerSetting = cloudSettings.find(s => s.id === 'header_data');
        if (headerSetting && headerSetting.data) {
          setHeaderData(headerSetting.data);
          localStorage.setItem('pikam_header_data', JSON.stringify(headerSetting.data));
        }

        const footerSetting = cloudSettings.find(s => s.id === 'footer_data');
        if (footerSetting && footerSetting.data) {
          setFooterData(footerSetting.data);
          localStorage.setItem('pikam_footer_data', JSON.stringify(footerSetting.data));
        }

        const notesSetting = cloudSettings.find(s => s.id === 'admin_notes_list');
        if (notesSetting && notesSetting.data) {
          setAdminNotesList(notesSetting.data);
          localStorage.setItem('pikam_admin_notes', JSON.stringify(notesSetting.data));
        }

        const subSetting = cloudSettings.find(s => s.id === 'newsletter_subscribers');
        if (subSetting && Array.isArray(subSetting.data)) {
          setNewsletterSubscribers(subSetting.data);
          localStorage.setItem('pikam_newsletter_subscribers', JSON.stringify(subSetting.data));
        }

        const usersSetting = cloudSettings.find(s => s.id === 'registered_users_list');
        if (usersSetting && Array.isArray(usersSetting.data) && usersSetting.data.length > 0) {
          usersSetting.data.forEach(u => {
            if (u && u.email) {
              const key = u.email.trim().toLowerCase();
              if (!userMap.has(key)) {
                userMap.set(key, u);
              } else {
                const existing = userMap.get(key);
                userMap.set(key, {
                  ...existing,
                  password: existing.password || u.password,
                  fullName: existing.fullName || u.fullName
                });
              }
            }
          });
        }

        const finalUsers = Array.from(userMap.values());
        setRegisteredUsersList(finalUsers);
        localStorage.setItem('pikam_registered_users', JSON.stringify(finalUsers));

        // Lock merged users into cloud site_settings so stale data never overwrites them
        try {
          await supabase.from('site_settings').upsert([{ id: 'registered_users_list', data: finalUsers }]);
        } catch (uErr) {
          console.log('Site settings users lock notice:', uErr);
        }
      }

      // 5. E-Dergi Issues
      const { data: cloudIssues } = await supabase.from('e_dergi_issues').select('*');
      if (cloudIssues && cloudIssues.length > 0) {
        const mappedIssues = cloudIssues.map(mapIssueFromCloud);
        setEDergiList(mappedIssues);
        localStorage.setItem('pikam_edergi_list', JSON.stringify(mappedIssues));
      }

      // 6. Articles List (Uses exact locked order from site_settings merged with cloud articles)
      const { data: cloudArticles } = await supabase.from('articles').select('*');
      let finalArticles = [];
      if (cloudArticles && cloudArticles.length > 0) {
        const mappedArts = cloudArticles.map(mapArticleFromCloud);
        const articlesOrderSetting = cloudSettings ? cloudSettings.find(s => s.id === 'articles_ordered_list') : null;

        if (articlesOrderSetting && Array.isArray(articlesOrderSetting.data) && articlesOrderSetting.data.length > 0) {
          const orderMap = new Map();
          articlesOrderSetting.data.forEach((item, index) => {
            const idKey = String(item.id || item).toLowerCase();
            orderMap.set(idKey, index);
          });
          mappedArts.sort((a, b) => {
            const indexA = orderMap.has(String(a.id).toLowerCase()) ? orderMap.get(String(a.id).toLowerCase()) : 999;
            const indexB = orderMap.has(String(b.id).toLowerCase()) ? orderMap.get(String(b.id).toLowerCase()) : 999;
            return indexA - indexB;
          });
        } else {
          mappedArts.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
        }

        finalArticles = mappedArts;
      } else {
        finalArticles = PIKAM_DATA.articles;
      }

      setArticlesList(finalArticles);
      localStorage.setItem('pikam_articles_list', JSON.stringify(finalArticles));
    } catch (err) {
      console.log('Supabase real-time sync notice:', err);
    }
  };

  useEffect(() => {
    fetchAndMergeCloudData(true);

    const handleFocusSync = () => fetchAndMergeCloudData(true);
    window.addEventListener('focus', handleFocusSync);

    // SUPABASE REALTIME SUBSCRIPTION FOR INSTANT CROSS-DEVICE SYNC
    const channel = supabase
      .channel('pikam-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchAndMergeCloudData(true);
      })
      .subscribe();

    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
        setIsAdmin(true);
      }

      if (hash.includes('reset-password') || hash.includes('access_token') || hash.includes('type=recovery')) {
        setIsAuthModalOpen(true);
      }

      if (path.includes('admin') || hash.includes('admin') || search.includes('admin')) {
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

  const handleOpenArticle = (art) => {
    setSelectedArticle(art);
    if (art && art.id) {
      const newUrl = `/${art.id}`;
      window.history.pushState({ articleId: art.id }, '', newUrl);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    window.history.pushState(null, '', '/');
  };

  useEffect(() => {
    const checkUrlArticle = () => {
      if (!articlesList || articlesList.length === 0) return;
      const pathStr = window.location.pathname.replace(/^\//, '').trim();
      const params = new URLSearchParams(window.location.search);
      const targetId = pathStr || params.get('article');
      
      if (targetId && targetId.toLowerCase() !== 'admin') {
        const found = articlesList.find(a => String(a.id).toLowerCase() === String(targetId).toLowerCase());
        if (found) {
          setSelectedArticle(found);
        }
      }
    };

    checkUrlArticle();
    window.addEventListener('popstate', checkUrlArticle);
    return () => window.removeEventListener('popstate', checkUrlArticle);
  }, [articlesList]);

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
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase visibility sync notice:', err);
    }
  };

  const handleToggleNavTab = async (tabKey) => {
    const updated = {
      ...navVisibility,
      [tabKey]: navVisibility[tabKey] === false ? true : false
    };
    setNavVisibility(updated);
    localStorage.setItem('pikam_nav_visibility', JSON.stringify(updated));

    try {
      await supabase.from('site_settings').upsert([{ id: 'nav_visibility', data: updated }]);
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase nav visibility notice:', err);
    }
  };

  const handleUpdateKunye = async (updatedKunye) => {
    setKunyeData(updatedKunye);
    localStorage.setItem('pikam_kunye_data', JSON.stringify(updatedKunye));

    try {
      await supabase.from('site_settings').upsert([{ id: 'kunye_data', data: updatedKunye }]);
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase kunye sync notice:', err);
    }
  };

  const handleUpdateHeroFeatured = async (updatedHero) => {
    setHeroFeatured(updatedHero);
    localStorage.setItem('pikam_hero_featured', JSON.stringify(updatedHero));

    try {
      await supabase.from('site_settings').upsert([{ id: 'hero_featured', data: updatedHero }]);
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase hero sync notice:', err);
    }
  };

  const handleSaveAuthorsCloud = async (newList) => {
    setAuthorsList(newList);
    localStorage.setItem('pikam_authors_list', JSON.stringify(newList));
    try {
      await supabase.from('site_settings').upsert([{ id: 'authors_ordered_list', data: newList }]);
      for (let i = 0; i < newList.length; i++) {
        await supabase.from('authors').upsert([{ ...mapAuthorForCloud(newList[i]), displayorder: i }]);
      }
    } catch (err) {
      console.log('Supabase author order sync notice:', err);
    }
  };

  const handleAddAuthor = async (newAuthor) => {
    const updated = [newAuthor, ...authorsList];
    handleSaveAuthorsCloud(updated);
  };

  const handleUpdateAuthor = async (updatedAuthor) => {
    const updated = authorsList.map(a => a.id === updatedAuthor.id ? updatedAuthor : a);
    handleSaveAuthorsCloud(updated);
  };

  const handleDeleteAuthor = async (authorId) => {
    const updated = authorsList.filter(a => a.id !== authorId);
    setAuthorsList(updated);
    localStorage.setItem('pikam_authors_list', JSON.stringify(updated));
    try {
      await supabase.from('authors').delete().eq('id', authorId);
      await supabase.from('site_settings').upsert([{ id: 'authors_ordered_list', data: updated }]);
    } catch (err) {
      console.log('Supabase author delete notice:', err);
    }
  };

  const handleMoveAuthorUp = (index) => {
    if (index <= 0) return;
    const newList = [...authorsList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    handleSaveAuthorsCloud(newList);
  };

  const handleMoveAuthorDown = (index) => {
    if (index >= authorsList.length - 1) return;
    const newList = [...authorsList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    handleSaveAuthorsCloud(newList);
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

  const handleDeleteUser = async (userId, userEmail) => {
    const updated = registeredUsersList.filter(u => {
      const matchId = userId && u.id === userId;
      const matchEmail = userEmail && u.email && u.email.trim().toLowerCase() === userEmail.trim().toLowerCase();
      return !matchId && !matchEmail;
    });

    setRegisteredUsersList(updated);
    localStorage.setItem('pikam_registered_users', JSON.stringify(updated));

    try {
      if (userId) {
        await supabase.from('profiles').delete().eq('id', userId);
      }
      if (userEmail) {
        await supabase.from('profiles').delete().eq('email', userEmail.trim().toLowerCase());
      }
      await supabase.from('site_settings').upsert([{ id: 'registered_users_list', data: updated }]);
    } catch (err) {
      console.log('Supabase profile delete notice:', err);
    }
  };

  const handleAddEDergi = async (newIssue) => {
    const updated = [newIssue, ...eDergiList];
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('e_dergi_issues').upsert([mapIssueForCloud(newIssue)]);
      if (error) {
        console.error('Supabase E-Dergi add error:', error);
      } else {
        console.log('✓ E-Dergi successfully upserted to Supabase Cloud!');
        fetchAndMergeCloudData();
      }
    } catch (err) {
      console.log('Supabase edergi add notice:', err);
    }
  };

  const handleUpdateEDergi = async (updatedIssue) => {
    const updated = eDergiList.map(i => i.id === updatedIssue.id ? updatedIssue : i);
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));

    try {
      const { error } = await supabase.from('e_dergi_issues').upsert([mapIssueForCloud(updatedIssue)]);
      if (error) {
        console.error('Supabase E-Dergi update error:', error);
      } else {
        console.log('✓ E-Dergi successfully updated in Supabase Cloud!');
        fetchAndMergeCloudData();
      }
    } catch (err) {
      console.log('Supabase edergi update notice:', err);
    }
  };

  const handleToggleHideEDergi = async (id) => {
    const updated = eDergiList.map(i => {
      if (i.id === id) {
        return { ...i, hidden: !i.hidden };
      }
      return i;
    });
    setEDergiList(updated);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(updated));

    const target = updated.find(i => i.id === id);
    if (target) {
      try {
        await supabase.from('e_dergi_issues').upsert([mapIssueForCloud(target)]);
      } catch (err) {
        console.log('Supabase edergi hide notice:', err);
      }
    }
  };

  const handleMoveEDergiUp = (index) => {
    if (index <= 0) return;
    const newList = [...eDergiList];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setEDergiList(newList);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(newList));
  };

  const handleMoveEDergiDown = (index) => {
    if (index >= eDergiList.length - 1) return;
    const newList = [...eDergiList];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setEDergiList(newList);
    localStorage.setItem('pikam_edergi_list', JSON.stringify(newList));
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

  const handleSaveArticlesCloud = async (newList) => {
    setArticlesList(newList);
    localStorage.setItem('pikam_articles_list', JSON.stringify(newList));

    try {
      await supabase.from('site_settings').upsert([{ id: 'articles_ordered_list', data: newList }]);
      for (let i = 0; i < newList.length; i++) {
        await supabase.from('articles').upsert([{ ...mapArticleForCloud(newList[i]), display_order: i }]);
      }
    } catch (err) {
      console.log('Supabase article order sync notice:', err);
    }
  };

  const handleAddArticle = async (newArticle) => {
    const updated = [newArticle, ...articlesList];
    handleSaveArticlesCloud(updated);
  };

  const handleUpdateArticle = async (updatedArticle) => {
    const updated = articlesList.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    handleSaveArticlesCloud(updated);
  };

  const handleToggleHideArticle = async (articleId) => {
    const updated = articlesList.map(a => {
      if (a.id === articleId) {
        return { ...a, hidden: !a.hidden };
      }
      return a;
    });
    handleSaveArticlesCloud(updated);
  };

  const handleMoveArticleUp = async (index) => {
    if (index === 0) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    handleSaveArticlesCloud(updated);
  };

  const handleMoveArticleDown = async (index) => {
    if (index === articlesList.length - 1) return;
    const updated = [...articlesList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    handleSaveArticlesCloud(updated);
  };

  const handleDeleteArticle = async (id) => {
    const updated = articlesList.filter(a => a.id !== id);
    setArticlesList(updated);
    localStorage.setItem('pikam_articles_list', JSON.stringify(updated));

    try {
      await supabase.from('articles').delete().eq('id', id);
      await supabase.from('site_settings').upsert([{ id: 'articles_ordered_list', data: updated }]);
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

  const handleSaveNotesCloud = async (updatedNotes) => {
    setAdminNotesList(updatedNotes);
    localStorage.setItem('pikam_admin_notes', JSON.stringify(updatedNotes));
    try {
      await supabase.from('site_settings').upsert([{ id: 'admin_notes_list', data: updatedNotes }]);
    } catch (err) {
      console.log('Supabase notes sync notice:', err);
    }
  };

  const handleAddNote = (newNote) => {
    const updated = [newNote, ...adminNotesList];
    handleSaveNotesCloud(updated);
  };

  const handleUpdateNote = (updatedNote) => {
    const updated = adminNotesList.map(n => n.id === updatedNote.id ? updatedNote : n);
    handleSaveNotesCloud(updated);
  };

  const handleToggleCompleteNote = (noteId) => {
    const updated = adminNotesList.map(n => n.id === noteId ? { ...n, isCompleted: !n.isCompleted } : n);
    handleSaveNotesCloud(updated);
  };

  const handleDeleteNote = (noteId) => {
    const updated = adminNotesList.filter(n => n.id !== noteId);
    handleSaveNotesCloud(updated);
  };

  const handleUpdateHeaderData = async (updatedHeader) => {
    setHeaderData(updatedHeader);
    localStorage.setItem('pikam_header_data', JSON.stringify(updatedHeader));
    try {
      await supabase.from('site_settings').upsert([{ id: 'header_data', data: updatedHeader }]);
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase header sync notice:', err);
    }
  };

  const handleUpdateFooterData = async (updatedFooter) => {
    setFooterData(updatedFooter);
    localStorage.setItem('pikam_footer_data', JSON.stringify(updatedFooter));
    try {
      await supabase.from('site_settings').upsert([{ id: 'footer_data', data: updatedFooter }]);
      fetchAndMergeCloudData(true);
    } catch (err) {
      console.log('Supabase footer sync notice:', err);
    }
  };

  const handleSubscribeNewsletter = async (email) => {
    if (!email || !email.includes('@')) return false;
    const cleanEmail = email.trim();
    const existing = newsletterSubscribers.find(s => s.email.toLowerCase() === cleanEmail.toLowerCase());
    if (existing) return true;

    const newSub = {
      id: `sub-${Date.now()}`,
      email: cleanEmail,
      subscribedAt: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updated = [newSub, ...newsletterSubscribers];
    setNewsletterSubscribers(updated);
    localStorage.setItem('pikam_newsletter_subscribers', JSON.stringify(updated));
    try {
      await supabase.from('site_settings').upsert([{ id: 'newsletter_subscribers', data: updated }]);
    } catch (err) {
      console.log('Newsletter cloud sync notice:', err);
    }
    return true;
  };

  const handleDeleteSubscriber = async (subId) => {
    const updated = newsletterSubscribers.filter(s => s.id !== subId);
    setNewsletterSubscribers(updated);
    localStorage.setItem('pikam_newsletter_subscribers', JSON.stringify(updated));
    try {
      await supabase.from('site_settings').upsert([{ id: 'newsletter_subscribers', data: updated }]);
    } catch (err) {
      console.log('Newsletter cloud sync notice:', err);
    }
  };

  const handleForcePushCloudAll = async () => {
    try {
      console.log('☁️ Pushing ALL local state to Supabase Cloud Database...');

      for (const issue of eDergiList) {
        await supabase.from('e_dergi_issues').upsert([mapIssueForCloud(issue)]);
      }

      for (const article of articlesList) {
        await supabase.from('articles').upsert([mapArticleForCloud(article)]);
      }

      for (const author of authorsList) {
        await supabase.from('authors').upsert([mapAuthorForCloud(author)]);
      }

      await supabase.from('site_settings').upsert([
        { id: 'hero_featured', data: heroFeatured },
        { id: 'section_visibility', data: sectionVisibility },
        { id: 'nav_visibility', data: navVisibility },
        { id: 'kunye_data', data: kunyeData },
        { id: 'admin_notes_list', data: adminNotesList },
        { id: 'authors_ordered_list', data: authorsList },
        { id: 'header_data', data: headerData },
        { id: 'footer_data', data: footerData },
        { id: 'newsletter_subscribers', data: newsletterSubscribers }
      ]);

      await fetchAndMergeCloudData();
      return true;
    } catch (err) {
      console.error('Push all cloud error:', err);
      return false;
    }
  };

  // RENDER ADMIN PANEL IF ADMIN ROUTE DETECTED
  if (isAdmin) {
    return (
      <AdminPanel 
        eDergiList={eDergiList}
        onAddEDergi={handleAddEDergi}
        onUpdateEDergi={handleUpdateEDergi}
        onToggleHideEDergi={handleToggleHideEDergi}
        onMoveEDergiUp={handleMoveEDergiUp}
        onMoveEDergiDown={handleMoveEDergiDown}
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
        onMoveAuthorUp={handleMoveAuthorUp}
        onMoveAuthorDown={handleMoveAuthorDown}
        heroFeatured={heroFeatured}
        onUpdateHeroFeatured={handleUpdateHeroFeatured}
        sectionVisibility={sectionVisibility}
        onToggleSection={handleToggleSection}
        navVisibility={navVisibility}
        onToggleNavTab={handleToggleNavTab}
        kunyeData={kunyeData}
        onUpdateKunye={handleUpdateKunye}
        allCommentsList={allCommentsList}
        onDeleteComment={handleDeleteComment}
        adminNotesList={adminNotesList}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onToggleCompleteNote={handleToggleCompleteNote}
        onDeleteNote={handleDeleteNote}
        headerData={headerData}
        onUpdateHeaderData={handleUpdateHeaderData}
        footerData={footerData}
        onUpdateFooterData={handleUpdateFooterData}
        newsletterSubscribers={newsletterSubscribers}
        onDeleteSubscriber={handleDeleteSubscriber}
        onForceSyncCloud={handleForcePushCloudAll}
      />
    );
  }

  // MAIN WEBSITE INTERFACE
  return (
    <div className="app-root">
      <Navbar 
        activeCategory={activeCategory}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenKunye={() => setIsKunyeOpen(true)}
        onScrollToEDergi={scrollToEDergi}
        onScrollToYazarlar={scrollToYazarlar}
        navVisibility={navVisibility}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogoutUser={handleLogoutUser}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <Header 
        headerData={headerData}
        sectionVisibility={sectionVisibility}
      />

      {sectionVisibility.showTicker && (
        <Ticker 
          onSelectArticle={handleOpenArticle}
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
            onSelectArticle={handleOpenArticle}
          />
        )}

        <EditorialFeed 
          activeCategory={activeCategory}
          articlesList={articlesList}
          onSelectArticle={handleOpenArticle}
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
        footerData={footerData}
        headerData={headerData}
        sectionVisibility={sectionVisibility}
        onSubscribeNewsletter={handleSubscribeNewsletter}
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
          onClose={handleCloseArticle}
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
          articlesList={articlesList}
          eDergiList={eDergiList}
          authorsList={authorsList}
          onClose={() => setIsSearchOpen(false)}
          onSelectArticle={handleOpenArticle}
          onSelectEDergi={(issue) => setSelectedEDergi(issue)}
        />
      )}

      {isKunyeOpen && (
        <KunyeModal 
          onClose={() => setIsKunyeOpen(false)}
          kunyeData={kunyeData}
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
