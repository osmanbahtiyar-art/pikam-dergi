import React, { useState, useEffect } from 'react';
import { Lock, LogOut, PlusCircle, BookOpen, FileText, CheckCircle2, Trash2, Upload, ShieldCheck, Eye, Loader2, Users, Download, Image as ImageIcon, Newspaper, Feather, EyeOff, Settings, Edit3, Layout, X, ArrowUp, ArrowDown, MessageSquare, Compass, Info, AlignLeft, StickyNote, CheckSquare, Square, AlertCircle, Tag, Mail, Phone, MapPin, Globe, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

import { processPdfFile } from '../lib/pdfHelper';

export default function AdminPanel({ 
  eDergiList = [], onAddEDergi, onUpdateEDergi, onToggleHideEDergi, onMoveEDergiUp, onMoveEDergiDown, onDeleteEDergi, 
  onAddArticle, onUpdateArticle, onToggleHideArticle, onMoveArticleUp, onMoveArticleDown, articlesList = [], onDeleteArticle, 
  registeredUsersList = [], onDeleteUser,
  authorsList = [], onAddAuthor, onDeleteAuthor, onUpdateAuthor, onMoveAuthorUp, onMoveAuthorDown,
  heroFeatured = {}, onUpdateHeroFeatured,
  sectionVisibility = {}, onToggleSection,
  navVisibility = {}, onToggleNavTab,
  kunyeData = {}, onUpdateKunye,
  allCommentsList = [], onDeleteComment,
  adminNotesList = [], onAddNote, onUpdateNote, onToggleCompleteNote, onDeleteNote,
  headerData = {}, onUpdateHeaderData,
  footerData = {}, onUpdateFooterData,
  newsletterSubscribers = [], onDeleteSubscriber,
  onForceSyncCloud
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('pikam_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('uyeler');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [liveUsersList, setLiveUsersList] = useState(registeredUsersList);

  useEffect(() => {
    setLiveUsersList(registeredUsersList);
  }, [registeredUsersList]);

  const DEFAULT_REGISTERED_USERS = [
    { id: "usr-1", fullName: "İrem Kumral", email: "kumralirem2@gmail.com", phone: "05330150441", interests: "EKONOMİ, POLİTİKA, DÜNYA", registeredAt: "29.07.2026 17:04:29" },
    { id: "usr-2", fullName: "Miraç Çavuş", email: "miraccavus.tr@gmail.com", phone: "05362609640", interests: "DÜNYA", registeredAt: "29.07.2026 17:05:50" },
    { id: "usr-3", fullName: "Sılanur Gör", email: "silanur9812@gmail.com", phone: "05436561266", interests: "EKONOMİ, POLİTİKA, STRATEJİ, TEKNOLOJİ, DÜNYA", registeredAt: "30.07.2026 00:37:53" },
    { id: "usr-4", fullName: "Osman Bahtiyar", email: "osmanbahtiyar@gmail.com", phone: "05551234567", interests: "POLİTİKA, EKONOMİ, STRATEJİ", registeredAt: "01.08.2026 12:00:00" },
    { id: "usr-5", fullName: "Prof. Dr. Ahmet Yılmaz", email: "ahmet.yilmaz@pikamtr.com", phone: "05321112233", interests: "AKADEMİ, STRATEJİ", registeredAt: "05.08.2026 14:20:10" },
    { id: "usr-6", fullName: "Sera Erdağı", email: "sera.erdagi@gmail.com", phone: "05429988776", interests: "POLİTİKA, KÜLTÜR SANAT", registeredAt: "10.08.2026 16:45:00" },
    { id: "usr-7", fullName: "Dr. Elif Kaya", email: "elif.kaya@pikamtr.com", phone: "05054443322", interests: "DÜNYA, DİPLOMASİ", registeredAt: "12.08.2026 09:15:30" },
    { id: "usr-8", fullName: "Caner Öztürk", email: "caner.ozturk@gmail.com", phone: "05307776655", interests: "JEOPOLİTİK, FİNANS", registeredAt: "15.08.2026 11:30:00" }
  ];

  const fetchLiveUsersFromCloud = async () => {
    try {
      const userMap = new Map();
      DEFAULT_REGISTERED_USERS.forEach(u => userMap.set(u.email.trim().toLowerCase(), u));
      (registeredUsersList || []).forEach(u => u && u.email && userMap.set(u.email.trim().toLowerCase(), u));

      const { data: cloudProfiles } = await supabase.from('profiles').select('*');
      if (cloudProfiles && cloudProfiles.length > 0) {
        cloudProfiles.forEach(p => {
          if (p && p.email) {
            const key = p.email.trim().toLowerCase();
            const existing = userMap.get(key) || {};
            userMap.set(key, {
              id: p.id || existing.id || `usr-${Date.now()}`,
              fullName: p.full_name || p.fullName || existing.fullName || 'PİKAM Okuru',
              email: p.email,
              password: p.password || existing.password || '',
              phone: p.phone || existing.phone || '',
              interests: p.interests || existing.interests || 'POLİTİKA, EKONOMİ',
              registeredAt: p.registered_at || p.registeredAt || existing.registeredAt || new Date().toLocaleDateString('tr-TR')
            });
          }
        });
      }

      const { data: cloudSettings } = await supabase.from('site_settings').select('*').eq('id', 'registered_users_list').maybeSingle();
      if (cloudSettings && Array.isArray(cloudSettings.data)) {
        cloudSettings.data.forEach(u => {
          if (u && u.email) {
            const key = u.email.trim().toLowerCase();
            if (!userMap.has(key)) userMap.set(key, u);
          }
        });
      }

      const finalLive = Array.from(userMap.values());
      setLiveUsersList(finalLive);
      localStorage.setItem('pikam_registered_users', JSON.stringify(finalLive));
    } catch (err) {
      console.log('Admin live users fetch notice:', err);
    }
  };

  // AUTOMATIC REAL-TIME USER POLLING TIMER FOR ADMIN PANEL
  useEffect(() => {
    let timer;
    if (activeTab === 'uyeler') {
      fetchLiveUsersFromCloud();
      timer = setInterval(() => {
        fetchLiveUsersFromCloud();
      }, 3000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTab]);

  // Header CMS Form State
  const [headerEmblemUrl, setHeaderEmblemUrl] = useState(headerData.emblemUrl || '/pikam_blue_emblem.png');
  const [headerLogotypeUrl, setHeaderLogotypeUrl] = useState(headerData.logotypeUrl || '/pikam_blue_logotype.png');
  const [headerShowEmblem, setHeaderShowEmblem] = useState(headerData.showEmblem !== false);
  const [headerShowLogotype, setHeaderShowLogotype] = useState(headerData.showLogotype !== false);
  const [headerShowPortalBadge, setHeaderShowPortalBadge] = useState(headerData.showPortalBadge !== false);
  const [headerShowIssn, setHeaderShowIssn] = useState(headerData.showIssn !== false);
  const [headerShowTagline, setHeaderShowTagline] = useState(headerData.showTagline !== false);
  const [headerShowAbout, setHeaderShowAbout] = useState(headerData.showAbout !== false);
  const [headerShowSocials, setHeaderShowSocials] = useState(headerData.showSocials !== false);
  const [headerLinkedinUrl, setHeaderLinkedinUrl] = useState(headerData.linkedinUrl || 'https://linkedin.com');
  const [headerTwitterUrl, setHeaderTwitterUrl] = useState(headerData.twitterUrl || 'https://x.com');
  const [headerInstagramUrl, setHeaderInstagramUrl] = useState(headerData.instagramUrl || 'https://instagram.com');
  const [headerYoutubeUrl, setHeaderYoutubeUrl] = useState(headerData.youtubeUrl || 'https://youtube.com');
  const [headerTitle, setHeaderTitle] = useState(headerData.title || 'PİKAM DERGİ');
  const [headerFullTitle, setHeaderFullTitle] = useState(headerData.fullTitle || 'Politik ve İktisadi Araştırmalar Merkezi');
  const [headerTagline, setHeaderTagline] = useState(headerData.tagline || 'Türkiye\'nin politik ve iktisadi geleceğine yön veren düşünce merkezi.');
  const [headerAboutText, setHeaderAboutText] = useState(headerData.aboutText || 'PİKAM Dergi; Politik ve İktisadi Araştırmalar Merkezi bünyesinde yayınlanan, küresel jeopolitik, iktisadi stratejiler ve kamu politikaları alanında bağımsız ve akademik analizler sunan dijital yayın organıdır.');
  const [headerIssn, setHeaderIssn] = useState(headerData.issn || 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026');
  const [headerPortalUrl, setHeaderPortalUrl] = useState(headerData.portalUrl || 'https://www.pikamtr.com/');
  const [headerPortalLabel, setHeaderPortalLabel] = useState(headerData.portalLabel || 'pikamtr.com');

  // Footer CMS Form State
  const [footerLogoUrl, setFooterLogoUrl] = useState(footerData.logoUrl || '/pikam_logo.png');
  const [footerTitle, setFooterTitle] = useState(footerData.title || 'PİKAM DERGİ');
  const [footerDescription, setFooterDescription] = useState(footerData.description || 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.');
  const [footerPortalUrl, setFooterPortalUrl] = useState(footerData.portalUrl || 'https://www.pikamtr.com/');
  const [footerPortalLabel, setFooterPortalLabel] = useState(footerData.portalLabel || 'Merkez Portalı: www.pikamtr.com');
  const [footerIssnText, setFooterIssnText] = useState(footerData.issnText || 'ISSN: 2717-9842 | Ankara, Türkiye');
  const [footerCopyrightText, setFooterCopyrightText] = useState(footerData.copyrightText || '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.');

  useEffect(() => {
    if (headerData) {
      setHeaderEmblemUrl(headerData.emblemUrl || '/pikam_blue_emblem.png');
      setHeaderLogotypeUrl(headerData.logotypeUrl || '/pikam_blue_logotype.png');
      setHeaderShowEmblem(headerData.showEmblem !== false);
      setHeaderShowLogotype(headerData.showLogotype !== false);
      setHeaderShowPortalBadge(headerData.showPortalBadge !== false);
      setHeaderShowIssn(headerData.showIssn !== false);
      setHeaderShowTagline(headerData.showTagline !== false);
      setHeaderShowAbout(headerData.showAbout !== false);
      setHeaderShowSocials(headerData.showSocials !== false);
      setHeaderLinkedinUrl(headerData.linkedinUrl || 'https://linkedin.com');
      setHeaderTwitterUrl(headerData.twitterUrl || 'https://x.com');
      setHeaderInstagramUrl(headerData.instagramUrl || 'https://instagram.com');
      setHeaderYoutubeUrl(headerData.youtubeUrl || 'https://youtube.com');
      setHeaderTitle(headerData.title || 'PİKAM DERGİ');
      setHeaderFullTitle(headerData.fullTitle || 'Politik ve İktisadi Araştırmalar Merkezi');
      setHeaderTagline(headerData.tagline || 'Türkiye\'nin politik ve iktisadi geleceğine yön veren düşünce merkezi.');
      setHeaderAboutText(headerData.aboutText || 'PİKAM Dergi; Politik ve İktisadi Araştırmalar Merkezi bünyesinde yayınlanan, küresel jeopolitik, iktisadi stratejiler ve kamu politikaları alanında bağımsız ve akademik analizler sunan dijital yayın organıdır.');
      setHeaderIssn(headerData.issn || 'ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026');
      setHeaderPortalUrl(headerData.portalUrl || 'https://www.pikamtr.com/');
      setHeaderPortalLabel(headerData.portalLabel || 'pikamtr.com');
    }
  }, [headerData]);

  useEffect(() => {
    if (footerData) {
      setFooterLogoUrl(footerData.logoUrl || '/pikam_logo.png');
      setFooterTitle(footerData.title || 'PİKAM DERGİ');
      setFooterDescription(footerData.description || 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.');
      setFooterPortalUrl(footerData.portalUrl || 'https://www.pikamtr.com/');
      setFooterPortalLabel(footerData.portalLabel || 'Merkez Portalı: www.pikamtr.com');
      setFooterIssnText(footerData.issnText || 'ISSN: 2717-9842 | Ankara, Türkiye');
      setFooterCopyrightText(footerData.copyrightText || '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.');
    }
  }, [footerData]);

  // Admin Notes & Todo Form State
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState('Yapılacaklar');
  const [notePriority, setNotePriority] = useState('Yüksek');
  const [noteFilter, setNoteFilter] = useState('tum');

  const startEditNote = (note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content || '');
    setNoteCategory(note.category || 'Yapılacaklar');
    setNotePriority(note.priority || 'Yüksek');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteCategory('Yapılacaklar');
    setNotePriority('Yüksek');
  };

  const handleSaveNoteForm = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const dateStr = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editingNoteId) {
      const existing = adminNotesList.find(n => n.id === editingNoteId);
      const updated = {
        ...existing,
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        priority: notePriority,
        createdAt: dateStr
      };
      if (onUpdateNote) onUpdateNote(updated);
      setSuccessMsg(`"${noteTitle}" notu başarıyla güncellendi ve buluta kaydedildi!`);
      cancelEditNote();
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        title: noteTitle,
        content: noteContent,
        category: noteCategory,
        priority: notePriority,
        isCompleted: false,
        createdAt: dateStr
      };
      if (onAddNote) onAddNote(newNote);
      setSuccessMsg(`"${noteTitle}" notu oluşturuldu ve buluta kaydedildi!`);
      cancelEditNote();
    }
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // E-Dergi Form State
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [issueNumber, setIssueNumber] = useState('Sayı 75');
  const [monthYear, setMonthYear] = useState('Ağustos 2026');
  const [theme, setTheme] = useState('Doğu Akdeniz ve Yeni Enerji Geopolitiği');
  const [pageCount, setPageCount] = useState(72);
  const [coverImage, setCoverImage] = useState('/pikam_kapak_temmuz_1784839785714.jpg');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState('');
  const [customPdfUrl, setCustomPdfUrl] = useState('');
  const [pagesDataUrls, setPagesDataUrls] = useState([]);
  const [isPdfProcessing, setIsPdfProcessing] = useState(false);
  const [editorNote, setEditorNote] = useState('PİKAM 75. sayımızda Doğu Akdeniz enerji koridorları ve küresel makroekonomi masaya yatırılıyor.');

  const startEditIssue = (issue) => {
    setEditingIssueId(issue.id);
    setIssueNumber(issue.issueNumber || issue.issuenumber || '');
    setMonthYear(issue.monthYear || issue.monthyear || '');
    setTheme(issue.theme || '');
    setPageCount(issue.pageCount || issue.pagecount || 64);
    setCoverImage(issue.coverImage || issue.coverimage || '');
    setPdfFileName(issue.pdfFileName || issue.pdffilename || '');
    if (issue.pagesDataUrls) setPagesDataUrls(issue.pagesDataUrls);
    setActiveTab('edergi');
  };

  const cancelEditIssue = () => {
    setEditingIssueId(null);
    setIssueNumber('Sayı 75');
    setMonthYear('Ağustos 2026');
    setTheme('Doğu Akdeniz ve Yeni Enerji Geopolitiği');
    setPageCount(72);
    setCoverImage('/pikam_kapak_temmuz_1784839785714.jpg');
    setPdfFile(null);
    setPdfFileName('');
    setPagesDataUrls([]);
  };

  // Article Form & Edit State
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('POLİTİKA');
  const [artAuthor, setArtAuthor] = useState('Prof. Dr. Ahmet Yılmaz');
  const [artDate, setArtDate] = useState('29 Temmuz 2026');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artImage, setArtImage] = useState('');

  // Author Form & Edit State
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorAffiliation, setAuthorAffiliation] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [authorLatest, setAuthorLatest] = useState('');

  // Künye Edit Form State & Visibility Toggles
  const [kunyeSahip, setKunyeSahip] = useState(kunyeData?.yayinSahibi || kunyeData?.imtiyazSahibi || 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) A.Ş.');
  const [kunyeShowSahip, setKunyeShowSahip] = useState(kunyeData?.showYayinSahibi !== false);

  const [kunyeYonetmen, setKunyeYonetmen] = useState(kunyeData?.yayinYonetmeni || kunyeData?.genelYayinYonetmeni || 'Prof. Dr. Osman Bahtiyar');
  const [kunyeShowYonetmen, setKunyeShowYonetmen] = useState(kunyeData?.showYayinYonetmeni !== false);

  const [kunyeEditor, setKunyeEditor] = useState(kunyeData?.sorumluYaziIsleri || kunyeData?.editor || 'Doç. Dr. Selin Aksoy');
  const [kunyeShowEditor, setKunyeShowEditor] = useState(kunyeData?.showSorumluYaziIsleri !== false);

  const [kunyeGrafik, setKunyeGrafik] = useState(kunyeData?.grafikTasarim || 'PİKAM Dijital Yayıncılık Servisi');
  const [kunyeShowGrafik, setKunyeShowGrafik] = useState(kunyeData?.showGrafikTasarim !== false);

  const [kunyeDanisma, setKunyeDanisma] = useState(Array.isArray(kunyeData?.akademikDanismaKurulu) ? kunyeData.akademikDanismaKurulu.join(', ') : (kunyeData?.akademikDanismaKurulu || 'Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir'));
  const [kunyeShowDanisma, setKunyeShowDanisma] = useState(kunyeData?.showAkademikDanismaKurulu !== false);

  const [kunyeAdres, setKunyeAdres] = useState(kunyeData?.iletisim?.adres || kunyeData?.adres || 'PİKAM Genel Merkezi, Ankara / Türkiye');
  const [kunyeShowAdres, setKunyeShowAdres] = useState(kunyeData?.showAdres !== false);

  const [kunyeTelefon, setKunyeTelefon] = useState(kunyeData?.iletisim?.telefon || kunyeData?.telefon || '+90 (312) 400 00 00');
  const [kunyeShowTelefon, setKunyeShowTelefon] = useState(kunyeData?.showTelefon !== false);

  const [kunyeEposta, setKunyeEposta] = useState(kunyeData?.iletisim?.eposta || kunyeData?.eposta || 'info@pikamdergi.com');
  const [kunyeShowEposta, setKunyeShowEposta] = useState(kunyeData?.showEposta !== false);

  const [kunyeWeb, setKunyeWeb] = useState(kunyeData?.iletisim?.web || kunyeData?.web || 'www.pikamtr.com');
  const [kunyeShowWeb, setKunyeShowWeb] = useState(kunyeData?.showWeb !== false);

  // Hero Main Featured CMS Form State
  const [heroTitle, setHeroTitle] = useState(heroFeatured?.title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(heroFeatured?.subtitle || '');
  const [heroCategory, setHeroCategory] = useState(heroFeatured?.category || 'EKONOMİ & STRATEJİ');
  const [heroImage, setHeroImage] = useState(heroFeatured?.image || '');
  const [heroAuthorName, setHeroAuthorName] = useState(typeof heroFeatured?.author === 'object' ? heroFeatured.author.name : heroFeatured?.author || 'Prof. Dr. Ahmet Yılmaz');
  const [heroAuthorTitle, setHeroAuthorTitle] = useState(typeof heroFeatured?.author === 'object' ? heroFeatured.author.title : 'PİKAM Ekonomi Araştırmaları Direktörü');
  const [heroReadTime, setHeroReadTime] = useState(heroFeatured?.readTime || '8 Dakika');

  useEffect(() => {
    if (heroFeatured) {
      setHeroTitle(heroFeatured.title || '');
      setHeroSubtitle(heroFeatured.subtitle || '');
      setHeroCategory(heroFeatured.category || 'EKONOMİ & STRATEJİ');
      setHeroImage(heroFeatured.image || '');
      setHeroAuthorName(typeof heroFeatured.author === 'object' ? heroFeatured.author.name : heroFeatured.author || 'Prof. Dr. Ahmet Yılmaz');
      setHeroAuthorTitle(typeof heroFeatured.author === 'object' ? heroFeatured.author.title : 'PİKAM Ekonomi Araştırmaları Direktörü');
      setHeroReadTime(heroFeatured.readTime || '8 Dakika');
    }
  }, [heroFeatured]);

  useEffect(() => {
    if (kunyeData) {
      setKunyeSahip(kunyeData.yayinSahibi || kunyeData.imtiyazSahibi || 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) A.Ş.');
      setKunyeShowSahip(kunyeData.showYayinSahibi !== false);

      setKunyeYonetmen(kunyeData.yayinYonetmeni || kunyeData.genelYayinYonetmeni || 'Prof. Dr. Osman Bahtiyar');
      setKunyeShowYonetmen(kunyeData.showYayinYonetmeni !== false);

      setKunyeEditor(kunyeData.sorumluYaziIsleri || kunyeData.editor || 'Doç. Dr. Selin Aksoy');
      setKunyeShowEditor(kunyeData.showSorumluYaziIsleri !== false);

      setKunyeGrafik(kunyeData.grafikTasarim || 'PİKAM Dijital Yayıncılık Servisi');
      setKunyeShowGrafik(kunyeData.showGrafikTasarim !== false);

      setKunyeDanisma(Array.isArray(kunyeData.akademikDanismaKurulu) ? kunyeData.akademikDanismaKurulu.join(', ') : (kunyeData.akademikDanismaKurulu || 'Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir'));
      setKunyeShowDanisma(kunyeData.showAkademikDanismaKurulu !== false);

      setKunyeAdres(kunyeData.iletisim?.adres || kunyeData.adres || 'PİKAM Genel Merkezi, Ankara / Türkiye');
      setKunyeShowAdres(kunyeData.showAdres !== false);

      setKunyeTelefon(kunyeData.iletisim?.telefon || kunyeData.telefon || '+90 (312) 400 00 00');
      setKunyeShowTelefon(kunyeData.showTelefon !== false);

      setKunyeEposta(kunyeData.iletisim?.eposta || kunyeData.eposta || 'info@pikamdergi.com');
      setKunyeShowEposta(kunyeData.showEposta !== false);

      setKunyeWeb(kunyeData.iletisim?.web || kunyeData.web || 'www.pikamtr.com');
      setKunyeShowWeb(kunyeData.showWeb !== false);
    }
  }, [kunyeData]);

  const processPermanentImage = async (file) => {
    if (!file) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.9);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          resolve(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const permUrl = await processPermanentImage(file);
      if (permUrl) setHeroImage(permUrl);
    }
  };

  const handleAuthorAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const permUrl = await processPermanentImage(file);
      if (permUrl) setAuthorAvatar(permUrl);
    }
  };

  const handleArticleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const permUrl = await processPermanentImage(file);
      if (permUrl) setArtImage(permUrl);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'pikam2026') {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('pikam_admin_auth', 'true');
      } catch (err) {
        console.log('Session storage error:', err);
      }
      setLoginError('');
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre! Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('pikam_admin_auth');
    } catch (err) {
      console.log('Session storage error:', err);
    }
    setUsername('');
    setPassword('');
  };

  const startEditArticle = (article) => {
    setEditingArticleId(article.id);
    setArtTitle(article.title || '');
    setArtCategory(article.category || 'POLİTİKA');
    setArtAuthor(typeof article.author === 'string' ? article.author : article.author?.name || 'Prof. Dr. Ahmet Yılmaz');
    setArtDate((article.date && article.date.replace(' (Düzenlendi)', '')) || '29 Temmuz 2026');
    setArtExcerpt(article.excerpt || '');
    setArtImage(article.image || '');
    setActiveTab('makale');
  };

  const cancelEditArticle = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtCategory('POLİTİKA');
    setArtAuthor('Prof. Dr. Ahmet Yılmaz');
    setArtDate('29 Temmuz 2026');
    setArtExcerpt('');
    setArtImage('');
  };

  const startEditAuthor = (author) => {
    setEditingAuthorId(author.id);
    setAuthorName(author.name || '');
    setAuthorRole(author.role || '');
    setAuthorAffiliation(author.affiliation || '');
    setAuthorAvatar(author.avatar || '');
    setAuthorLatest(author.latestArticle || '');
  };

  const cancelEditAuthor = () => {
    setEditingAuthorId(null);
    setAuthorName('');
    setAuthorRole('');
    setAuthorAffiliation('');
    setAuthorAvatar('');
    setAuthorLatest('');
  };

  const handleExportUsersCSV = () => {
    if (!registeredUsersList || registeredUsersList.length === 0) {
      alert('Henüz kayıtlı üye bulunmamaktadır.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Ad Soyad,E-Posta,Telefon,İlgi Alanları,Kayıt Tarihi ve Saati\n";
    registeredUsersList.forEach(u => {
      csvContent += `"${u.fullName}","${u.email}","${u.phone}","${u.interests}","${u.registeredAt}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PIKAM_Dergi_Kayıtlı_Üyeler_${new Date().toLocaleDateString('tr-TR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveHeroFeatured = (e) => {
    e.preventDefault();
    if (!heroTitle || !heroSubtitle) return;

    const updatedHero = {
      ...heroFeatured,
      title: heroTitle,
      subtitle: heroSubtitle,
      category: heroCategory,
      image: heroImage,
      readTime: heroReadTime,
      author: {
        name: heroAuthorName,
        title: heroAuthorTitle,
        avatar: typeof heroFeatured?.author === 'object' ? heroFeatured.author.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }
    };

    onUpdateHeroFeatured(updatedHero);
    setSuccessMsg('Ana Sayfa Manşet haberi başarıyla güncellendi ve sitede yayına alındı!');
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handleSaveAuthorForm = (e) => {
    e.preventDefault();
    if (!authorName) return;

    if (editingAuthorId) {
      const updatedAuthor = {
        id: editingAuthorId,
        name: authorName,
        role: authorRole,
        affiliation: authorAffiliation,
        avatar: authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        latestArticle: authorLatest || 'PİKAM Kıdemli Analisti'
      };
      onUpdateAuthor(updatedAuthor);
      setSuccessMsg(`"${authorName}" ekibimizin bilgileri başarıyla güncellendi!`);
      cancelEditAuthor();
    } else {
      const newAuthor = {
        id: `auth-${Date.now()}`,
        name: authorName,
        role: authorRole,
        affiliation: authorAffiliation,
        avatar: authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        latestArticle: authorLatest || 'PİKAM Kıdemli Analisti'
      };
      onAddAuthor(newAuthor);
      setSuccessMsg(`"${authorName}" başarıyla ekibimize eklendi ve yayına alındı!`);
      cancelEditAuthor();
    }
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handleSaveKunyeForm = (e) => {
    e.preventDefault();

    const updatedKunye = {
      yayinSahibi: kunyeSahip,
      imtiyazSahibi: kunyeSahip,
      showYayinSahibi: kunyeShowSahip,

      yayinYonetmeni: kunyeYonetmen,
      genelYayinYonetmeni: kunyeYonetmen,
      showYayinYonetmeni: kunyeShowYonetmen,

      sorumluYaziIsleri: kunyeEditor,
      editor: kunyeEditor,
      showSorumluYaziIsleri: kunyeShowEditor,

      grafikTasarim: kunyeGrafik,
      showGrafikTasarim: kunyeShowGrafik,

      akademikDanismaKurulu: kunyeDanisma ? kunyeDanisma.split(',').map(s => s.trim()).filter(Boolean) : [],
      showAkademikDanismaKurulu: kunyeShowDanisma,

      showAdres: kunyeShowAdres,
      showTelefon: kunyeShowTelefon,
      showEposta: kunyeShowEposta,
      showWeb: kunyeShowWeb,

      iletisim: {
        adres: kunyeAdres,
        telefon: kunyeTelefon,
        eposta: kunyeEposta,
        web: kunyeWeb
      }
    };

    if (onUpdateKunye) onUpdateKunye(updatedKunye);
    setSuccessMsg('✓ PİKAM Dergi Künye ve Kurumsal Bilgileri başarıyla güncellendi ve buluta kaydedildi!');
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handlePublishEDergi = async (e) => {
    e.preventDefault();
    if (!issueNumber || !theme || !monthYear) return;

    setIsPublishing(true);

    const safePdfUrl = customPdfUrl || ((pdfDataUrl && pdfDataUrl.length < 1500000) ? pdfDataUrl : '#');

    if (editingIssueId) {
      const updatedIssue = {
        id: editingIssueId,
        issueNumber,
        monthYear,
        theme,
        coverImage: coverImage || '/pikam_kapak_temmuz_1784839785714.jpg',
        pdfUrl: safePdfUrl,
        pdfFileName: pdfFileName || 'PIKAM_Dergi_Dijital.pdf',
        pageCount: parseInt(pageCount) || (pagesDataUrls.length ? pagesDataUrls.length : 64),
        pagesDataUrls: pagesDataUrls || [],
        pages: pagesDataUrls.length > 0 ? pagesDataUrls.map((url, idx) => ({
          page: idx + 1,
          title: idx === 0 ? 'Kapak' : `Sayfa ${idx + 1}`,
          imageUrl: url
        })) : [
          { page: 1, title: 'Kapak', subtitle: `${monthYear} Öne Çıkanlar` },
          { page: 2, title: 'Editörden', content: editorNote }
        ]
      };
      if (onUpdateEDergi) onUpdateEDergi(updatedIssue);
      setSuccessMsg(`"${issueNumber} (${monthYear})"` + ' sayısı başarıyla güncellendi!');
      cancelEditIssue();
    } else {
      const newIssue = {
        id: `ed-${Date.now()}`,
        issueNumber,
        monthYear,
        theme,
        coverImage: coverImage || '/pikam_kapak_temmuz_1784839785714.jpg',
        pdfUrl: safePdfUrl,
        pdfFileName: pdfFileName || 'PIKAM_Dergi_Dijital.pdf',
        pageCount: parseInt(pageCount) || (pagesDataUrls.length ? pagesDataUrls.length : 64),
        pagesDataUrls: pagesDataUrls || [],
        pages: pagesDataUrls.length > 0 ? pagesDataUrls.map((url, idx) => ({
          page: idx + 1,
          title: idx === 0 ? 'Kapak' : `Sayfa ${idx + 1}`,
          imageUrl: url
        })) : [
          { page: 1, title: 'Kapak', subtitle: `${monthYear} Öne Çıkanlar` },
          { page: 2, title: 'Editörden', content: editorNote },
          { page: 3, title: 'İçindekiler & Yayın Kurulu', content: '04-20 Küresel Ticaret | 21-40 Enerji Jeopolitiği | 41-72 Yapay Zeka Doktrini' }
        ]
      };

      onAddEDergi(newIssue);
      setSuccessMsg(`"${issueNumber} (${monthYear}) - ${theme}" başarıyla pikamdergi.com sitesinde yayınlandı!`);
      cancelEditIssue();
    }

    setIsPublishing(false);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    if (!artTitle || !artExcerpt) return;

    setIsPublishing(true);

    const categoryColors = {
      'POLİTİKA': '#ef4444',
      'EKONOMİ': '#10b981',
      'FİNANS': '#059669',
      'KÜLTÜR SANAT': '#d97706',
      'STRATEJİ': '#6366f1',
      'TEKNOLOJİ': '#06b6d4',
      'DÜNYA': '#f59e0b'
    };

    const categoryDefaultImages = {
      'POLİTİKA': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      'EKONOMİ': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      'FİNANS': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
      'KÜLTÜR SANAT': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      'STRATEJİ': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80',
      'TEKNOLOJİ': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      'DÜNYA': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80'
    };

    const finalImage = artImage || categoryDefaultImages[artCategory] || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80';
    const finalDate = artDate.trim() || '29 Temmuz 2026';

    const formatParagraphsToHtml = (text) => {
      if (!text) return '';
      const cleanText = text.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
      const paragraphs = cleanText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
      return paragraphs
        .map(p => `<p style="margin-bottom: 1.4rem; line-height: 1.8;">${p.replace(/\n/g, '<br />')}</p>`)
        .join('');
    };

    const formattedContent = formatParagraphsToHtml(artExcerpt);

    if (editingArticleId) {
      // UPDATE EXISTING ARTICLE
      const updatedArt = {
        id: editingArticleId,
        category: artCategory,
        categoryColor: categoryColors[artCategory] || '#ef4444',
        title: artTitle,
        excerpt: artExcerpt,
        author: artAuthor,
        date: finalDate,
        readTime: '6 Dakika',
        image: finalImage,
        content: formattedContent
      };
      onUpdateArticle(updatedArt);
      setSuccessMsg(`"${artTitle}" makalesi başarıyla güncellendi!`);
      cancelEditArticle();
    } else {
      // ADD NEW ARTICLE - CALCULATE NEXT yayinlar-N ID
      const yayinlarNumbers = (articlesList || [])
        .map(a => {
          const match = String(a.id || '').match(/^yayinlar-(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(n => !isNaN(n));
      const maxNum = yayinlarNumbers.length > 0 ? Math.max(...yayinlarNumbers) : (articlesList || []).length;
      const nextId = `yayinlar-${maxNum + 1}`;

      const newArt = {
        id: nextId,
        category: artCategory,
        categoryColor: categoryColors[artCategory] || '#ef4444',
        title: artTitle,
        excerpt: artExcerpt,
        author: artAuthor,
        date: finalDate,
        readTime: '6 Dakika',
        image: finalImage,
        content: formattedContent
      };
      onAddArticle(newArt);
      setSuccessMsg(`"${artTitle}" makalesi kapak görseliyle birlikte saniyeler içinde sitede yayına girdi!`);
      cancelEditArticle();
    }

    setIsPublishing(false);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  // LOGIN SCREEN RENDER
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b132b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', maxWidth: '420px', width: '100%', borderRadius: '12px', padding: '36px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '80px', height: '80px', margin: '0 auto 12px auto' }} />
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', letterSpacing: '1px', margin: 0 }}>
              PİKAM DERGİ YÖNETİCİ GİRİŞİ
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
              İçerik Yönetim Sistemi (CMS) Paneli
            </p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '20px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KULLANICI ADI</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Kullanıcı adınızı giriniz" 
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ŞİFRE</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Şifrenizi giriniz" 
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ background: '#0b132b', color: 'white', padding: '12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} />
              <span>Giriş Yap</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const allNavCategories = [
    { id: 'ANASAYFA', label: 'ANASAYFA' },
    { id: 'E-DERGİ', label: 'E-DERGİ' },
    { id: 'POLİTİKA', label: 'POLİTİKA' },
    { id: 'EKONOMİ', label: 'EKONOMİ' },
    { id: 'FİNANS', label: 'FİNANS' },
    { id: 'KÜLTÜR SANAT', label: 'KÜLTÜR SANAT' },
    { id: 'KÜNYE', label: 'KÜNYE' },
    { id: 'EKİBİMİZ', label: 'EKİBİMİZ' }
  ];

  // LOGGED IN ADMIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* ADMIN HEADER */}
      <header style={{ background: '#0b132b', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '42px', height: '42px' }} />
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', letterSpacing: '1px', margin: 0 }}>
              PİKAM DERGİ GELİŞMİŞ CMS YÖNETİM PANELİ
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>Tam Arayüz, Akış, Sıralama, Yorum ve Üye Portalı (pikamdergi.com/admin)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            disabled={isSyncingAll}
            onClick={async () => {
              setIsSyncingAll(true);
              try {
                if (onForceSyncCloud) {
                  await onForceSyncCloud();
                }
              } catch (err) {
                console.log('Force sync click notice:', err);
              } finally {
                setIsSyncingAll(false);
                setSuccessMsg('✓ Bilgisayardaki tüm veriler canlı bulut veritabanına aktarıldı ve tüm dünyada yayına alındı! 🚀');
                setTimeout(() => setSuccessMsg(''), 7000);
              }
            }} 
            style={{ background: isSyncingAll ? '#059669' : '#10b981', color: 'white', padding: '6px 14px', borderRadius: '4px', fontSize: '0.82rem', border: 'none', cursor: isSyncingAll ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            {isSyncingAll ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
            <span>{isSyncingAll ? 'Buluta Yükleniyor...' : 'Bilgisayardaki Verileri Buluta Yükle'}</span>
          </button>
          <a href="/" target="_blank" rel="noreferrer" style={{ background: '#1c2541', color: '#e2e8f0', padding: '6px 14px', borderRadius: '4px', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
            <Eye size={14} /> Sitede Gör ↗
          </a>
          <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '4px', fontSize: '0.82rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY */}
      <div style={{ maxWidth: '1200px', margin: '32px auto', padding: '0 20px' }}>
        {/* SUCCESS NOTIFICATION */}
        {successMsg && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '14px 20px', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', marginBottom: '24px', borderLeft: '5px solid #16a34a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('uyeler')} 
            style={{ background: activeTab === 'uyeler' ? '#0b132b' : '#ffffff', color: activeTab === 'uyeler' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} color={activeTab === 'uyeler' ? '#38bdf8' : '#0284c7'} />
            <span>Kayıtlı Okuyucular ({registeredUsersList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('notlar')} 
            style={{ background: activeTab === 'notlar' ? '#0b132b' : '#ffffff', color: activeTab === 'notlar' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <StickyNote size={15} color={activeTab === 'notlar' ? '#fde047' : '#eab308'} />
            <span>Yönetici Notları & Yapılacaklar ({adminNotesList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('yorumlar')} 
            style={{ background: activeTab === 'yorumlar' ? '#0b132b' : '#ffffff', color: activeTab === 'yorumlar' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <MessageSquare size={15} color={activeTab === 'yorumlar' ? '#38bdf8' : '#ec4899'} />
            <span>Okuyucu Yorumları ({allCommentsList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('manset_akis')} 
            style={{ background: activeTab === 'manset_akis' ? '#0b132b' : '#ffffff', color: activeTab === 'manset_akis' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layout size={15} color={activeTab === 'manset_akis' ? '#38bdf8' : '#10b981'} />
            <span>Ana Sayfa Akışı & Manşet</span>
          </button>

          <button 
            onClick={() => setActiveTab('yazarlar_yonetimi')} 
            style={{ background: activeTab === 'yazarlar_yonetimi' ? '#0b132b' : '#ffffff', color: activeTab === 'yazarlar_yonetimi' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Feather size={15} color={activeTab === 'yazarlar_yonetimi' ? '#38bdf8' : '#8b5cf6'} />
            <span>Ekibimiz & Kadro ({authorsList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('site_ayarlari')} 
            style={{ background: activeTab === 'site_ayarlari' ? '#0b132b' : '#ffffff', color: activeTab === 'site_ayarlari' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={15} color={activeTab === 'site_ayarlari' ? '#38bdf8' : '#06b6d4'} />
            <span>Bölüm ve Menü Ayarları (Gizle/Göster)</span>
          </button>

          <button 
            onClick={() => setActiveTab('kunye_duzenle')} 
            style={{ background: activeTab === 'kunye_duzenle' ? '#0b132b' : '#ffffff', color: activeTab === 'kunye_duzenle' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Info size={15} color={activeTab === 'kunye_duzenle' ? '#38bdf8' : '#e11d48'} />
            <span>Künye Düzenle</span>
          </button>

          <button 
            onClick={() => setActiveTab('makale_listesi')} 
            style={{ background: activeTab === 'makale_listesi' ? '#0b132b' : '#ffffff', color: activeTab === 'makale_listesi' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Newspaper size={15} color={activeTab === 'makale_listesi' ? '#38bdf8' : '#eab308'} />
            <span>Makale Yönetimi & Sıralama ({articlesList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('edergi')} 
            style={{ background: activeTab === 'edergi' ? '#0b132b' : '#ffffff', color: activeTab === 'edergi' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <BookOpen size={15} />
            <span>E-Dergi PDF Yükle</span>
          </button>

          <button 
            onClick={() => setActiveTab('arsiv')} 
            style={{ background: activeTab === 'arsiv' ? '#0b132b' : '#ffffff', color: activeTab === 'arsiv' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={15} />
            <span>Dergi Sayıları ({eDergiList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('header_footer')} 
            style={{ background: activeTab === 'header_footer' ? '#0b132b' : '#ffffff', color: activeTab === 'header_footer' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Layout size={15} color={activeTab === 'header_footer' ? '#38bdf8' : '#6366f1'} />
            <span>Header & Footer (Üst ve Alt Yönetimi)</span>
          </button>

          <button 
            onClick={() => setActiveTab('bulten_aboneleri')} 
            style={{ background: activeTab === 'bulten_aboneleri' ? '#0b132b' : '#ffffff', color: activeTab === 'bulten_aboneleri' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Mail size={15} color={activeTab === 'bulten_aboneleri' ? '#38bdf8' : '#0284c7'} />
            <span>E-Bülten Aboneleri ({newsletterSubscribers.length})</span>
          </button>

          <button 
            onClick={() => { setActiveTab('makale'); cancelEditArticle(); }} 
            style={{ background: activeTab === 'makale' ? '#0b132b' : '#ffffff', color: activeTab === 'makale' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>Yeni Makale Ekle</span>
          </button>
        </div>

        {/* TAB: E-BÜLTEN ABONELERİ (MAIL LİSTESİ) */}
        {activeTab === 'bulten_aboneleri' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Mail size={22} color="#0284c7" />
                  <span>HAFTALIK E-BÜLTEN ABONE LİSTESİ ({newsletterSubscribers.length})</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Web sitenizin altındaki E-Bülten formundan kayıt olan tüm okuyucuların e-posta adresleri burada listelenir.
                </p>
              </div>

              {newsletterSubscribers.length > 0 && (
                <button 
                  onClick={() => {
                    const allEmails = newsletterSubscribers.map(s => s.email).join(', ');
                    navigator.clipboard.writeText(allEmails);
                    setSuccessMsg('✓ Tüm E-Bülten e-posta adresleri panoya kopyalandı!');
                    setTimeout(() => setSuccessMsg(''), 4000);
                  }}
                  style={{ background: '#0284c7', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={15} />
                  <span>TÜM MAİLLERİ KOPYALA ({newsletterSubscribers.length})</span>
                </button>
              )}
            </div>

            {newsletterSubscribers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <Mail size={40} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.1rem', color: '#475569', margin: '0 0 6px 0' }}>Henüz E-Bülten abonesi bulunmuyor</h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0 }}>Web sitenizdeki "HAFTALIK E-BÜLTEN" formundan kayıt olanların mailleri anında buraya eklenecektir.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '800' }}>#</th>
                      <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '800' }}>ABONE E-POSTA ADRESİ</th>
                      <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '800' }}>KAYIT TARİHİ</th>
                      <th style={{ padding: '12px 16px', color: '#1e293b', fontWeight: '800', textAlign: 'right' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsletterSubscribers.map((sub, idx) => (
                      <tr key={sub.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 16px', fontWeight: '700', color: '#0f172a' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '4px' }}>
                            <Mail size={14} /> {sub.email}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontWeight: '600' }}>
                          {sub.subscribedAt || 'Bilinmiyor'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button 
                            onClick={async () => {
                              if (window.confirm(`${sub.email} adresini bülten listesinden silmek istediğinize emin misiniz?`)) {
                                if (onDeleteSubscriber) await onDeleteSubscriber(sub.id);
                                setSuccessMsg('✓ Abone e-posta adresi listeden silindi.');
                                setTimeout(() => setSuccessMsg(''), 4000);
                              }
                            }}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} />
                            <span>Sil</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: HEADER & FOOTER YÖNETİMİ (ÜST VE ALT ALAN DÜZENLEME & GİZLEME) */}
        {activeTab === 'header_footer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. KISIM: ÜST HEADER BÖLÜMÜ YÖNETİMİ */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layout size={22} color="#0284c7" />
                    <span>SİTE ÜSTÜ (HEADER) LOGO VE METİN YÖNETİMİ</span>
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Web sitenizin en üstündeki amblem logosunu, tipografi logosunu, yazıları ve görünürlük ayarlarını buradan yönetebilirsiniz.
                  </p>
                </div>

                {/* SHOW/HIDE HEADER TOGGLE SWITCH */}
                <button 
                  onClick={() => {
                    const newStatus = sectionVisibility.showSiteHeader === false ? true : false;
                    if (onToggleSection) onToggleSection('showSiteHeader');
                    setSuccessMsg(`Site Üst Header Bölümü ${newStatus ? 'GÖSTERİLDİ' : 'GİZLENDİ'}`);
                    setTimeout(() => setSuccessMsg(''), 5000);
                  }}
                  style={{ background: sectionVisibility.showSiteHeader !== false ? '#dcfce7' : '#fef2f2', color: sectionVisibility.showSiteHeader !== false ? '#15803d' : '#dc2626', border: `1px solid ${sectionVisibility.showSiteHeader !== false ? '#86efac' : '#fca5a5'}`, padding: '10px 18px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {sectionVisibility.showSiteHeader !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>{sectionVisibility.showSiteHeader !== false ? 'HEADER SİTEDE YAYINDA (GİZLE)' : 'HEADER SİTEDE GİZLİ (GÖSTER)'}</span>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (onUpdateHeaderData) {
                  await onUpdateHeaderData({
                    showSiteHeader: sectionVisibility.showSiteHeader !== false,
                    emblemUrl: headerEmblemUrl,
                    logotypeUrl: headerLogotypeUrl,
                    showEmblem: headerShowEmblem,
                    showLogotype: headerShowLogotype,
                    showPortalBadge: headerShowPortalBadge,
                    showIssn: headerShowIssn,
                    showTagline: headerShowTagline,
                    showAbout: headerShowAbout,
                    showSocials: headerShowSocials,
                    linkedinUrl: headerLinkedinUrl,
                    twitterUrl: headerTwitterUrl,
                    instagramUrl: headerInstagramUrl,
                    youtubeUrl: headerYoutubeUrl,
                    title: headerTitle,
                    fullTitle: headerFullTitle,
                    tagline: headerTagline,
                    aboutText: headerAboutText,
                    issn: headerIssn,
                    portalUrl: headerPortalUrl,
                    portalLabel: headerPortalLabel
                  });
                }
                setSuccessMsg('✓ Site Kurumsal Logo, Metin ve Sosyal Medya Ayarları başarıyla buluta kaydedildi!');
                setTimeout(() => setSuccessMsg(''), 5000);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* LOGO GÖRSELLERİ VE GÖRÜNÜRLÜK */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  
                  {/* EMBLEM LOGO */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>1. SOL AMBLEM LOGO GÖRSELİ</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {headerEmblemUrl && <img src={headerEmblemUrl} alt="Emblem Preview" style={{ width: '50px', height: '50px', objectFit: 'contain', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px' }} />}
                      <input 
                        type="text" 
                        value={headerEmblemUrl} 
                        onChange={(e) => setHeaderEmblemUrl(e.target.value)} 
                        placeholder="/pikam_blue_emblem.png veya görsel URL adresi"
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                    
                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsPublishing(true);
                            const url = await processPermanentImage(file);
                            if (url) {
                              setHeaderEmblemUrl(url);
                              const updatedHeader = {
                                showSiteHeader: sectionVisibility.showSiteHeader !== false,
                                emblemUrl: url,
                                logotypeUrl: headerLogotypeUrl,
                                showEmblem: headerShowEmblem,
                                showLogotype: headerShowLogotype,
                                showPortalBadge: headerShowPortalBadge,
                                showIssn: headerShowIssn,
                                showTagline: headerShowTagline,
                                showAbout: headerShowAbout,
                                showSocials: headerShowSocials,
                                linkedinUrl: headerLinkedinUrl,
                                twitterUrl: headerTwitterUrl,
                                instagramUrl: headerInstagramUrl,
                                youtubeUrl: headerYoutubeUrl,
                                title: headerTitle,
                                fullTitle: headerFullTitle,
                                tagline: headerTagline,
                                aboutText: headerAboutText,
                                issn: headerIssn,
                                portalUrl: headerPortalUrl,
                                portalLabel: headerPortalLabel
                              };
                              if (onUpdateHeaderData) await onUpdateHeaderData(updatedHeader);
                              setSuccessMsg('✓ Yeni Amblem Logosu başarıyla yüklendi ve buluta kaydedildi!');
                              setTimeout(() => setSuccessMsg(''), 5000);
                            }
                            setIsPublishing(false);
                          }
                        }}
                        id="emblem-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="emblem-upload" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Upload size={13} /> {isPublishing ? 'Fotoğraf Yükleniyor...' : 'Bilgisayardan Yeni Amblem Yükle'}
                      </label>

                      <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" checked={headerShowEmblem} onChange={(e) => setHeaderShowEmblem(e.target.checked)} />
                        <span>Amblemi Göster</span>
                      </label>
                    </div>
                  </div>

                  {/* LOGOTYPE LOGO */}
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>2. ORTA TİPOGRAFİ LOGO GÖRSELİ</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {headerLogotypeUrl && <img src={headerLogotypeUrl} alt="Logotype Preview" style={{ maxHeight: '50px', maxWidth: '120px', objectFit: 'contain', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px' }} />}
                      <input 
                        type="text" 
                        value={headerLogotypeUrl} 
                        onChange={(e) => setHeaderLogotypeUrl(e.target.value)} 
                        placeholder="/pikam_blue_logotype.png veya görsel URL adresi"
                        style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsPublishing(true);
                            const url = await processPermanentImage(file);
                            if (url) {
                              setHeaderLogotypeUrl(url);
                              const updatedHeader = {
                                showSiteHeader: sectionVisibility.showSiteHeader !== false,
                                emblemUrl: headerEmblemUrl,
                                logotypeUrl: url,
                                showEmblem: headerShowEmblem,
                                showLogotype: headerShowLogotype,
                                showPortalBadge: headerShowPortalBadge,
                                showIssn: headerShowIssn,
                                showTagline: headerShowTagline,
                                showAbout: headerShowAbout,
                                showSocials: headerShowSocials,
                                linkedinUrl: headerLinkedinUrl,
                                twitterUrl: headerTwitterUrl,
                                instagramUrl: headerInstagramUrl,
                                youtubeUrl: headerYoutubeUrl,
                                title: headerTitle,
                                fullTitle: headerFullTitle,
                                tagline: headerTagline,
                                aboutText: headerAboutText,
                                issn: headerIssn,
                                portalUrl: headerPortalUrl,
                                portalLabel: headerPortalLabel
                              };
                              if (onUpdateHeaderData) await onUpdateHeaderData(updatedHeader);
                              setSuccessMsg('✓ Yeni Tipografi Logosu başarıyla yüklendi ve buluta kaydedildi!');
                              setTimeout(() => setSuccessMsg(''), 5000);
                            }
                            setIsPublishing(false);
                          }
                        }}
                        id="logotype-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="logotype-upload" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Upload size={13} /> {isPublishing ? 'Fotoğraf Yükleniyor...' : 'Bilgisayardan Tipografi Logo Yükle'}
                      </label>

                      <label style={{ fontSize: '0.82rem', color: '#334155', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" checked={headerShowLogotype} onChange={(e) => setHeaderShowLogotype(e.target.checked)} />
                        <span>Tipografi Logoyu Göster</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ÖZEL ELEMAN GİZLEME / GÖSTERME SEÇENEKLERİ (PORTAL BUTONU, ISSN, SLOGAN, HAKKIMIZDA, SOSYAL MEDYA) */}
                <div style={{ background: '#e0f2fe', padding: '16px 20px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0369a1' }}>ÖZEL ELEMAN GÖRÜNÜRLÜKLERİ:</span>

                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={headerShowPortalBadge} onChange={(e) => setHeaderShowPortalBadge(e.target.checked)} />
                    <span>PİKAM Kurumsal / Portal Butonunu Göster (Sitedeki Mavi Buton)</span>
                  </label>

                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={headerShowIssn} onChange={(e) => setHeaderShowIssn(e.target.checked)} />
                    <span>ISSN ve Yayın Tarihi Bilgisini Göster</span>
                  </label>

                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={headerShowTagline} onChange={(e) => setHeaderShowTagline(e.target.checked)} />
                    <span>Slogan / Motto Yazısını Göster</span>
                  </label>

                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={headerShowAbout} onChange={(e) => setHeaderShowAbout(e.target.checked)} />
                    <span>Hakkımızda Açıklama Kutusu Göster</span>
                  </label>

                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input type="checkbox" checked={headerShowSocials} onChange={(e) => setHeaderShowSocials(e.target.checked)} />
                    <span>Takip Edin / Sosyal Medya İkonlarını Göster</span>
                  </label>
                </div>

                {/* SOSYAL MEDYA TAKİP BAĞLANTILARI (LINKEDIN, TWITTER, INSTAGRAM, YOUTUBE) */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0b132b', display: 'block', marginBottom: '12px' }}>TAKİP EDİN: SOSYAL MEDYA YÖNLENDİRME LİNKLERİ</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0284c7', display: 'block', marginBottom: '4px' }}>LINKEDIN HESAP LİNKİ (URL)</label>
                      <input 
                        type="text" 
                        value={headerLinkedinUrl} 
                        onChange={(e) => setHeaderLinkedinUrl(e.target.value)} 
                        placeholder="İsteğe bağlı, boş bırakılabilir" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>X (TWITTER) HESAP LİNKİ (URL)</label>
                      <input 
                        type="text" 
                        value={headerTwitterUrl} 
                        onChange={(e) => setHeaderTwitterUrl(e.target.value)} 
                        placeholder="İsteğe bağlı, boş bırakılabilir" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#e11d48', display: 'block', marginBottom: '4px' }}>INSTAGRAM HESAP LİNKİ (URL)</label>
                      <input 
                        type="text" 
                        value={headerInstagramUrl} 
                        onChange={(e) => setHeaderInstagramUrl(e.target.value)} 
                        placeholder="İsteğe bağlı, boş bırakılabilir" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#dc2626', display: 'block', marginBottom: '4px' }}>YOUTUBE HESAP LİNKİ (URL)</label>
                      <input 
                        type="text" 
                        value={headerYoutubeUrl} 
                        onChange={(e) => setHeaderYoutubeUrl(e.target.value)} 
                        placeholder="İsteğe bağlı, boş bırakılabilir" 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>
                </div>

                {/* YAZILAR VE BAŞLIKLAR */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SİTE BAŞLIĞI</label>
                    <input 
                      type="text" 
                      value={headerTitle} 
                      onChange={(e) => setHeaderTitle(e.target.value)} 
                      placeholder="PİKAM DERGİ" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KURUMSAL İSİM / ALT BAŞLIK</label>
                    <input 
                      type="text" 
                      value={headerFullTitle} 
                      onChange={(e) => setHeaderFullTitle(e.target.value)} 
                      placeholder="Politik ve İktisadi Araştırmalar Merkezi" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAYIN SLOGANI / MOTTO</label>
                    <input 
                      type="text" 
                      value={headerTagline} 
                      onChange={(e) => setHeaderTagline(e.target.value)} 
                      placeholder="Türkiye'nin politik ve iktisadi geleceğine yön veren düşünce merkezi." 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ISSN VEYA YAYIN BİLGİSİ</label>
                    <input 
                      type="text" 
                      value={headerIssn} 
                      onChange={(e) => setHeaderIssn(e.target.value)} 
                      placeholder="ISSN 2717-9842 | Yıl: 7 | Sayı: 74 | Temmuz 2026" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>HAKKIMIZDA / PİKAM DERGİ NEDİR? TANITIM METNİ</label>
                    <textarea 
                      rows="3"
                      value={headerAboutText} 
                      onChange={(e) => setHeaderAboutText(e.target.value)} 
                      placeholder="PİKAM Dergi hakkında kısa tanıtım ve açıklama metni..." 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                    ></textarea>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>PORTAL LİNKİ (URL)</label>
                    <input 
                      type="url" 
                      value={headerPortalUrl} 
                      onChange={(e) => setHeaderPortalUrl(e.target.value)} 
                      placeholder="https://www.pikamtr.com/" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>PORTAL BUTON ETİKETİ</label>
                    <input 
                      type="text" 
                      value={headerPortalLabel} 
                      onChange={(e) => setHeaderPortalLabel(e.target.value)} 
                      placeholder="pikamtr.com" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{ background: '#0284c7', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>KURUMSAL ALAN AYARLARINI KAYDET VE BULUTA İŞLE</span>
                </button>
              </form>
            </div>


            {/* 2. KISIM: ALT FOOTER BÖLÜMÜ YÖNETİMİ */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layout size={22} color="#0f172a" />
                    <span>SİTE ALTI (FOOTER) LOGO VE METİN YÖNETİMİ</span>
                  </h2>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                    Web sitenizin alt kısmındaki logo, hakkımızda metni, portal linkleri ve telif hakkı yazılarını buradan düzenleyebilirsiniz.
                  </p>
                </div>

                {/* SHOW/HIDE FOOTER TOGGLE SWITCH */}
                <button 
                  onClick={() => {
                    const newStatus = sectionVisibility.showSiteFooter === false ? true : false;
                    if (onToggleSection) onToggleSection('showSiteFooter');
                    setSuccessMsg(`Site Alt Footer Bölümü ${newStatus ? 'GÖSTERİLDİ' : 'GİZLENDİ'}`);
                    setTimeout(() => setSuccessMsg(''), 5000);
                  }}
                  style={{ background: sectionVisibility.showSiteFooter !== false ? '#dcfce7' : '#fef2f2', color: sectionVisibility.showSiteFooter !== false ? '#15803d' : '#dc2626', border: `1px solid ${sectionVisibility.showSiteFooter !== false ? '#86efac' : '#fca5a5'}`, padding: '10px 18px', borderRadius: '6px', fontSize: '0.88rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {sectionVisibility.showSiteFooter !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>{sectionVisibility.showSiteFooter !== false ? 'FOOTER SİTEDE YAYINDA (GİZLE)' : 'FOOTER SİTEDE GİZLİ (GÖSTER)'}</span>
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (onUpdateFooterData) {
                  await onUpdateFooterData({
                    showSiteFooter: sectionVisibility.showSiteFooter !== false,
                    logoUrl: footerLogoUrl,
                    title: footerTitle,
                    description: footerDescription,
                    portalUrl: footerPortalUrl,
                    portalLabel: footerPortalLabel,
                    issnText: footerIssnText,
                    copyrightText: footerCopyrightText
                  });
                }
                setSuccessMsg('✓ Site Alt Footer Logo ve Metin Ayarları başarıyla buluta kaydedildi!');
                setTimeout(() => setSuccessMsg(''), 5000);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* FOOTER LOGO */}
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>FOOTER AMBLEM / LOGO GÖRSELİ</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {footerLogoUrl && <img src={footerLogoUrl} alt="Footer Logo Preview" style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#0b132b', borderRadius: '6px', padding: '4px' }} />}
                    <input 
                      type="text" 
                      value={footerLogoUrl} 
                      onChange={(e) => setFooterLogoUrl(e.target.value)} 
                      placeholder="/pikam_logo.png veya görsel URL adresi"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setIsPublishing(true);
                          const url = await processPermanentImage(file);
                          if (url) {
                            setFooterLogoUrl(url);
                            const updatedFooter = {
                              showSiteFooter: sectionVisibility.showSiteFooter !== false,
                              logoUrl: url,
                              title: footerTitle,
                              description: footerDescription,
                              portalUrl: footerPortalUrl,
                              portalLabel: footerPortalLabel,
                              issnText: footerIssnText,
                              copyrightText: footerCopyrightText
                            };
                            if (onUpdateFooterData) await onUpdateFooterData(updatedFooter);
                            setSuccessMsg('✓ Yeni Footer Logosu başarıyla yüklendi ve buluta kaydedildi!');
                            setTimeout(() => setSuccessMsg(''), 5000);
                          }
                          setIsPublishing(false);
                        }
                      }}
                      id="footer-logo-upload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="footer-logo-upload" style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Upload size={13} /> {isPublishing ? 'Fotoğraf Yükleniyor...' : 'Bilgisayardan Footer Logosu Yükle'}
                    </label>
                  </div>
                </div>

                {/* METİNLER */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>FOOTER BAŞLIĞI</label>
                    <input 
                      type="text" 
                      value={footerTitle} 
                      onChange={(e) => setFooterTitle(e.target.value)} 
                      placeholder="PİKAM DERGİ" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MERKEZ PORTALI LİNKİ (URL)</label>
                    <input 
                      type="url" 
                      value={footerPortalUrl} 
                      onChange={(e) => setFooterPortalUrl(e.target.value)} 
                      placeholder="https://www.pikamtr.com/" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>PORTAL LİNK ETİKETİ</label>
                    <input 
                      type="text" 
                      value={footerPortalLabel} 
                      onChange={(e) => setFooterPortalLabel(e.target.value)} 
                      placeholder="Merkez Portalı: www.pikamtr.com" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ISSN & YERLEŞKE METNİ</label>
                    <input 
                      type="text" 
                      value={footerIssnText} 
                      onChange={(e) => setFooterIssnText(e.target.value)} 
                      placeholder="ISSN: 2717-9842 | Ankara, Türkiye" 
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>FOOTER TANITIM / HAKKINDA METNİ</label>
                  <textarea 
                    rows="3" 
                    value={footerDescription} 
                    onChange={(e) => setFooterDescription(e.target.value)} 
                    placeholder="Politik ve İktisadi Araştırmalar Merkezi..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>EN ALT TELİF HAKKI (COPYRIGHT) YAZISI</label>
                  <input 
                    type="text" 
                    value={footerCopyrightText} 
                    onChange={(e) => setFooterCopyrightText(e.target.value)} 
                    placeholder="© 2026 PİKAM - Tüm Hakları Saklıdır." 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <button 
                  type="submit" 
                  style={{ background: '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={16} />
                  <span>ALT FOOTER AYARLARINI KAYDET VE BULUTA İŞLE</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB: YÖNETİCİ NOTLARI & YAPILACAKLAR */}
        {activeTab === 'notlar' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* STATS SUMMARY BAR */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#fef9c3', padding: '12px', borderRadius: '8px', color: '#ca8a04' }}>
                  <StickyNote size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>TOPLAM NOT & EKSİK</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#0f172a', margin: 0, fontWeight: '800' }}>{adminNotesList.length}</h3>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', color: '#dc2626' }}>
                  <AlertCircle size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>YÜKSEK ÖNCELİKLİ</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#dc2626', margin: 0, fontWeight: '800' }}>
                    {adminNotesList.filter(n => n.priority === 'Yüksek' && !n.isCompleted).length}
                  </h3>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '8px', color: '#15803d' }}>
                  <CheckSquare size={24} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700' }}>TAMAMLANAN GÖREVLER</span>
                  <h3 style={{ fontSize: '1.4rem', color: '#15803d', margin: 0, fontWeight: '800' }}>
                    {adminNotesList.filter(n => n.isCompleted).length}
                  </h3>
                </div>
              </div>
            </div>

            {/* FORM: YENİ NOT EKLE VEYA DÜZENLE */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', color: '#0b132b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <StickyNote size={22} color="#ca8a04" />
                  <span>{editingNoteId ? 'NOTU DÜZENLE VE GÜNCELLE' : 'YENİ NOT VEYA SİTE EKSİĞİ EKLE'}</span>
                </h2>

                {editingNoteId && (
                  <button onClick={cancelEditNote} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> Düzenlemeyi İptal Et
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveNoteForm} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>NOT BAŞLIĞI / KONU *</label>
                    <input 
                      type="text" 
                      value={noteTitle} 
                      onChange={(e) => setNoteTitle(e.target.value)} 
                      placeholder="Örn: Mobil Menü Butonu Hızlandırması" 
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '600' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KATEGORİ</label>
                    <select 
                      value={noteCategory} 
                      onChange={(e) => setNoteCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                    >
                      <option value="Yapılacaklar">Yapılacaklar</option>
                      <option value="Site Eksikleri">Site Eksikleri & Hatalar</option>
                      <option value="Strateji & Fikirler">Strateji & Fikirler</option>
                      <option value="Genel Notlar">Genel Notlar</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ÖNCELİK DERECESİ</label>
                    <select 
                      value={notePriority} 
                      onChange={(e) => setNotePriority(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff', fontWeight: '700', color: notePriority === 'Yüksek' ? '#dc2626' : notePriority === 'Orta' ? '#ca8a04' : '#0284c7' }}
                    >
                      <option value="Yüksek">🔴 Yüksek Öncelik</option>
                      <option value="Orta">🟡 Orta Öncelik</option>
                      <option value="Normal">🔵 Normal Öncelik</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>NOT DETAYLARI & AÇIKLAMA</label>
                  <textarea 
                    rows="3" 
                    value={noteContent} 
                    onChange={(e) => setNoteContent(e.target.value)} 
                    placeholder="Planlanan adımlar, yapılması gerekenler veya detayları buraya yazın..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  style={{ background: editingNoteId ? '#16a34a' : '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {editingNoteId ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                  <span>{editingNoteId ? 'NOTU GÜNCELLE VE BULUTA KAYDET' : 'NOTU OLUŞTUR VE BULUTA SENKRONİZE ET'}</span>
                </button>
              </form>
            </div>

            {/* LIST & FILTERS: NOTLAR VE EKSİKLER */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0b132b', margin: 0 }}>
                  KAYITLI YÖNETİCİ NOTLARI VE EKSİKLER ({adminNotesList.length})
                </h3>

                {/* FILTER BUTTONS */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { id: 'tum', label: 'Tümü' },
                    { id: 'yapilacak', label: 'Yapılacaklar' },
                    { id: 'eksik', label: 'Site Eksikleri' },
                    { id: 'tamamlanan', label: 'Tamamlananlar' }
                  ].map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setNoteFilter(f.id)}
                      style={{ background: noteFilter === f.id ? '#0b132b' : '#f1f5f9', color: noteFilter === f.id ? 'white' : '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {adminNotesList.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Henüz kaydedilmiş not bulunmamaktadır. Yukarıdaki formdan yeni not ekleyebilirsiniz.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {adminNotesList
                    .filter(n => {
                      if (noteFilter === 'yapilacak') return n.category === 'Yapılacaklar' && !n.isCompleted;
                      if (noteFilter === 'eksik') return n.category === 'Site Eksikleri' && !n.isCompleted;
                      if (noteFilter === 'tamamlanan') return n.isCompleted;
                      return true;
                    })
                    .map((note) => {
                      const isHigh = note.priority === 'Yüksek';
                      const isMed = note.priority === 'Orta';

                      return (
                        <div 
                          key={note.id} 
                          style={{ 
                            borderLeft: `5px solid ${isHigh ? '#ef4444' : isMed ? '#eab308' : '#0284c7'}`,
                            border: '1px solid #e2e8f0',
                            borderLeftWidth: '5px',
                            borderRadius: '8px',
                            padding: '18px',
                            background: note.isCompleted ? '#f8fafc' : '#ffffff',
                            opacity: note.isCompleted ? 0.75 : 1,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '14px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button 
                                  onClick={() => onToggleCompleteNote && onToggleCompleteNote(note.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.isCompleted ? '#16a34a' : '#94a3b8', padding: 0 }}
                                  title={note.isCompleted ? 'Tamamlandı işaretini kaldır' : 'Tamamlandı olarak işaretle'}
                                >
                                  {note.isCompleted ? <CheckSquare size={20} color="#16a34a" /> : <Square size={20} />}
                                </button>

                                <span style={{ fontSize: '0.72rem', fontWeight: '800', background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                                  {note.category || 'Genel'}
                                </span>
                              </div>

                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px', background: isHigh ? '#fef2f2' : isMed ? '#fefce8' : '#e0f2fe', color: isHigh ? '#dc2626' : isMed ? '#ca8a04' : '#0369a1' }}>
                                {note.priority || 'Normal'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '1rem', color: note.isCompleted ? '#64748b' : '#0f172a', margin: '4px 0 6px 0', textDecoration: note.isCompleted ? 'line-through' : 'none', fontWeight: '700' }}>
                              {note.title}
                            </h4>

                            {note.content && (
                              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                {note.content}
                              </p>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                            <span>{note.createdAt || 'Tarih Belirtilmedi'}</span>

                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => startEditNote(note)}
                                style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Edit3 size={11} /> Düzenle
                              </button>

                              <button 
                                onClick={() => {
                                  if (confirm(`"${note.title}" notunu silmek istediğinize emin misiniz?`)) {
                                    onDeleteNote(note.id);
                                  }
                                }}
                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Trash2 size={11} /> Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: KÜNYE DÜZENLEME FORMU */}
        {activeTab === 'kunye_duzenle' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={22} color="#e11d48" />
              <span>PİKAM DERGİ KÜNYESİ VE KURUMSAL BİLGİLERİ DÜZENLE</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Sitedeki "KÜNYE" butonuna tıklandığında açılan penceredeki tüm kurumsal unvan, kişi ve iletişim bilgilerini buradan güncelleyebilirsiniz.
            </p>

            <form onSubmit={handleSaveKunyeForm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* YAYIN SAHİBİ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>YAYIN / İMTİYAZ SAHİBİ</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowSahip ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowSahip} onChange={(e) => setKunyeShowSahip(e.target.checked)} />
                    <span>{kunyeShowSahip ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeSahip} 
                  onChange={(e) => setKunyeSahip(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* GENEL YAYIN YÖNETMENİ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>GENEL YAYIN YÖNETMENİ</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowYonetmen ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowYonetmen} onChange={(e) => setKunyeShowYonetmen(e.target.checked)} />
                    <span>{kunyeShowYonetmen ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeYonetmen} 
                  onChange={(e) => setKunyeYonetmen(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* SORUMLU YAZI İŞLERİ MÜDÜRÜ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>SORUMLU YAZI İŞLERİ MÜDÜRÜ / EDİTÖR</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowEditor ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowEditor} onChange={(e) => setKunyeShowEditor(e.target.checked)} />
                    <span>{kunyeShowEditor ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeEditor} 
                  onChange={(e) => setKunyeEditor(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* TASARIM VE GRAFİK MİMARİSİ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>TASARIM VE GRAFİK MİMARİSİ</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowGrafik ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowGrafik} onChange={(e) => setKunyeShowGrafik(e.target.checked)} />
                    <span>{kunyeShowGrafik ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeGrafik} 
                  onChange={(e) => setKunyeGrafik(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* AKADEMİK DANIŞMA VE HAKEM KURULU (SHOW/HIDE TOGGLE) */}
              <div style={{ gridColumn: 'span 2', background: '#e0f2fe', padding: '16px 20px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0369a1' }}>AKADEMİK DANIŞMA VE HAKEM KURULU (Virgülle Ayırın)</label>
                  <label style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                    <input type="checkbox" checked={kunyeShowDanisma} onChange={(e) => setKunyeShowDanisma(e.target.checked)} />
                    <span style={{ color: kunyeShowDanisma ? '#16a34a' : '#dc2626' }}>
                      {kunyeShowDanisma ? '✓ SİTEDE YAYINLANIYOR (AÇIK)' : '✕ SİTEDE GİZLENDİ (KAPALI)'}
                    </span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeDanisma} 
                  onChange={(e) => setKunyeDanisma(e.target.value)} 
                  placeholder="Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                />
              </div>

              {/* ADRES */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>ADRES</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowAdres ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowAdres} onChange={(e) => setKunyeShowAdres(e.target.checked)} />
                    <span>{kunyeShowAdres ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeAdres} 
                  onChange={(e) => setKunyeAdres(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* TELEFON NUMARASI */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>TELEFON NUMARASI</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowTelefon ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowTelefon} onChange={(e) => setKunyeShowTelefon(e.target.checked)} />
                    <span>{kunyeShowTelefon ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeTelefon} 
                  onChange={(e) => setKunyeTelefon(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* E-POSTA ADRESİ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>E-POSTA ADRESİ</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowEposta ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowEposta} onChange={(e) => setKunyeShowEposta(e.target.checked)} />
                    <span>{kunyeShowEposta ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeEposta} 
                  onChange={(e) => setKunyeEposta(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              {/* WEB ADRESİ */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>WEB ADRESİ</label>
                  <label style={{ fontSize: '0.8rem', color: kunyeShowWeb ? '#0284c7' : '#94a3b8', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input type="checkbox" checked={kunyeShowWeb} onChange={(e) => setKunyeShowWeb(e.target.checked)} />
                    <span>{kunyeShowWeb ? 'Sitede Açık' : 'Sitede Gizli'}</span>
                  </label>
                </div>
                <input 
                  type="text" 
                  value={kunyeWeb} 
                  onChange={(e) => setKunyeWeb(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <button 
                  type="submit" 
                  style={{ background: '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={18} color="#38bdf8" /> KÜNYE BİLGİLERİNİ SİTEDE GÜNCELLE VE YAYINLA
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: OKUYUCU YORUMLARI YÖNETİMİ */}
        {activeTab === 'yorumlar' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MessageSquare size={22} color="#ec4899" />
              <span>OKUYUCULAR TARAFINDAN YAPILAN GERÇEK YORUM VE DEĞERLENDİRMELER</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Sitede kayıtlı üyeler tarafından makalelere yazılan tüm yorumlar aşağıda listelenmiştir. Hangi makaleye yazıldığını görebilir, dilediğiniz yorumu tek tıkla silebilirsiniz.
            </p>

            {allCommentsList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>Henüz yapılmış bir okuyucu yorumu bulunmamaktadır. Okuyucular yorum yaptıkça burada birikecektir.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0b132b', color: 'white', fontSize: '0.82rem' }}>
                      <th style={{ padding: '12px 16px' }}>OKUYUCU</th>
                      <th style={{ padding: '12px 16px' }}>E-POSTA</th>
                      <th style={{ padding: '12px 16px' }}>YORUM METNİ</th>
                      <th style={{ padding: '12px 16px' }}>İLGİLİ MAKALE</th>
                      <th style={{ padding: '12px 16px' }}>TARİH</th>
                      <th style={{ padding: '12px 16px' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCommentsList.map((c, idx) => (
                      <tr key={c.id || idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.88rem', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>{c.authorName}</td>
                        <td style={{ padding: '14px 16px', color: '#0284c7' }}>{c.authorEmail}</td>
                        <td style={{ padding: '14px 16px', color: '#334155', maxWidth: '300px' }}>"{c.commentText}"</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#475569' }}>{c.articleTitle}</td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>{c.createdAt}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button 
                            onClick={() => {
                              if (confirm('Bu okuyucu yorumunu silmek istediğinize emin misiniz?')) {
                                onDeleteComment(c.id);
                              }
                            }}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} /> Yorumu Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: ANA SAYFA AKIŞI VE MANŞET HABERİ CMS */}
        {activeTab === 'manset_akis' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layout size={22} color="#10b981" />
              <span>ANA SAYFA MANŞET HABERİ GÜNCELLEME VE DÜZENLEME</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Sitenizin en üstünde dev boyutlu olarak yer alan Ana Manşet Kartının başlığını, özetini, kategorisini, yazarını ve görselini değiştirebilirsiniz.
            </p>

            <form onSubmit={handleSaveHeroFeatured} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MANŞET HABER BAŞLIĞI *</label>
                <input 
                  type="text" 
                  value={heroTitle} 
                  onChange={(e) => setHeroTitle(e.target.value)} 
                  placeholder="Ana sayfa büyük manşet başlığı" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '700' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MANŞET ÖZETİ / ALT BAŞLIĞI *</label>
                <textarea 
                  rows="3" 
                  value={heroSubtitle} 
                  onChange={(e) => setHeroSubtitle(e.target.value)} 
                  placeholder="Manşet haberin özet metni..." 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KATEGORİ VE ETİKET</label>
                <input 
                  type="text" 
                  value={heroCategory} 
                  onChange={(e) => setHeroCategory(e.target.value)} 
                  placeholder="Örn: EKONOMİ & STRATEJİ" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>OKUMA SÜRESİ</label>
                <input 
                  type="text" 
                  value={heroReadTime} 
                  onChange={(e) => setHeroReadTime(e.target.value)} 
                  placeholder="Örn: 8 Dakika Okuma" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR ADI VE SOYADI</label>
                <input 
                  type="text" 
                  value={heroAuthorName} 
                  onChange={(e) => setHeroAuthorName(e.target.value)} 
                  placeholder="Prof. Dr. Ahmet Yılmaz" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR UNVANI</label>
                <input 
                  type="text" 
                  value={heroAuthorTitle} 
                  onChange={(e) => setHeroAuthorTitle(e.target.value)} 
                  placeholder="PİKAM Ekonomi Araştırmaları Direktörü" 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MANŞET KAPAK GÖRSELİ (YÜKLE VEYA URL YAPIŞTIR)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={heroImage} alt="Manşet Önizleme" style={{ width: '160px', height: '90px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #10b981' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <input type="file" accept="image/*" onChange={handleHeroImageUpload} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    <input type="url" placeholder="Görsel Web Bağlantısı (https://...)" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                <button type="submit" style={{ background: '#0b132b', color: 'white', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={18} color="#38bdf8" /> MANŞET HABERİNİ SİTEDE GÜNCELLE VE YAYINLA
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: YAZARLAR VE AKADEMİK KADRO YÖNETİMİ & DÜZENLEME */}
        {activeTab === 'yazarlar_yonetimi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* FORM: YAZAR EKLE VEYA DÜZENLE */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Feather size={22} color="#8b5cf6" />
                  <span>{editingAuthorId ? 'EKİBİMİZ BİLGİLERİNİ DÜZENLE' : 'EKİBİMİZE YENİ AKADEMİSYEN VEYA ANALİST EKLE'}</span>
                </h2>

                {editingAuthorId && (
                  <button onClick={cancelEditAuthor} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> Düzenlemeyi İptal Et
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveAuthorForm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>AD VE SOYAD *</label>
                  <input 
                    type="text" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    placeholder="Prof. Dr. Canan Yılmaz" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>GÖREV / UNVAN</label>
                  <input 
                    type="text" 
                    value={authorRole} 
                    onChange={(e) => setAuthorRole(e.target.value)} 
                    placeholder="PİKAM Stratejik Araştırmalar Bölüm Başkanı" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>UZMANLIK VE KURUM</label>
                  <input 
                    type="text" 
                    value={authorAffiliation} 
                    onChange={(e) => setAuthorAffiliation(e.target.value)} 
                    placeholder="Uluslararası İlişkiler ve Jeopolitik" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>HAKKINDA / ÖZGEÇMİŞ BİLGİSİ</label>
                  <textarea 
                    rows="3"
                    value={authorLatest} 
                    onChange={(e) => setAuthorLatest(e.target.value)} 
                    placeholder="Ekip üyesi hakkında biyografi veya kısa tanıtım yazısı giriniz..." 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>PORTRE / AVATAR FOTOĞRAFI (YÜKLE VEYA URL YAPIŞTIR)</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img src={authorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} alt="Yazar Portre" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8b5cf6' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      <input type="file" accept="image/*" onChange={handleAuthorAvatarUpload} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      <input type="url" placeholder="Portre Web Bağlantısı (https://...)" value={authorAvatar} onChange={(e) => setAuthorAvatar(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                  <button type="submit" style={{ background: editingAuthorId ? '#16a34a' : '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.92rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingAuthorId ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                    <span>{editingAuthorId ? 'EKİBİMİZ BİLGİLERİNİ GÜNCELLE' : 'EKİBİMİZE KAYDET VE YAYINLA'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* LIST: MEVCUT YAZARLAR VE AKADEMİK KADRO */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0b132b', marginBottom: '20px' }}>
                SİTEDE YAYINDA OLAN EKİBİMİZ VE AKADEMİK KADRO ({authorsList.length})
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {authorsList.map((author, idx) => (
                  <div key={author.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img src={author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} alt={author.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0, fontWeight: '700' }}>{author.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: '600' }}>{author.role}</span>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0 0' }}>{author.affiliation}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => startEditAuthor(author)}
                          style={{ flex: 1, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Edit3 size={13} /> Düzenle
                        </button>

                        <button 
                          onClick={() => {
                            if (confirm(`"${author.name}" kişisini ekibimizden tamamen kaldırmak istediğinize emin misiniz?`)) {
                              onDeleteAuthor(author.id);
                            }
                          }}
                          style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} /> Sil
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          disabled={idx === 0}
                          onClick={() => onMoveAuthorUp && onMoveAuthorUp(idx)}
                          style={{ flex: 1, background: idx === 0 ? '#f1f5f9' : '#ffffff', color: idx === 0 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <ArrowUp size={13} /> Yukarı Taşı
                        </button>

                        <button 
                          disabled={idx === authorsList.length - 1}
                          onClick={() => onMoveAuthorDown && onMoveAuthorDown(idx)}
                          style={{ flex: 1, background: idx === authorsList.length - 1 ? '#f1f5f9' : '#ffffff', color: idx === authorsList.length - 1 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === authorsList.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <ArrowDown size={13} /> Aşağı Taşı
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ARAYÜZ, MENÜ SEKMELERİ VE BÖLÜM AYARLARI (GİZLE / GÖSTER) */}
        {activeTab === 'site_ayarlari' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* SUB-SECTION 1: NAVBAR MENÜ SEKMELERİ GÖRÜNÜRLÜĞÜ */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Compass size={22} color="#0284c7" />
                <span>ÜST MENÜ SEKMELERİ GÖRÜNÜRLÜK AYARLARI (GİZLE / GÖSTER)</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
                Sitenizin koyu lacivert üst menü çubuğunda yer alan sekmeleri dilediğiniz gibi **Gizleyebilir** veya **Gösterebilirsiniz.** (Örn: POLİTİKA, EKONOMİ, FİNANS vb. kategorileri gizleyebilirsiniz).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {allNavCategories.map((cat) => {
                  const isVisible = navVisibility[cat.id] !== false;
                  return (
                    <div key={cat.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: isVisible ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: 0, fontWeight: '700' }}>{cat.label} Sekmesi</h4>
                        <span style={{ fontSize: '0.75rem', color: isVisible ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                          {isVisible ? 'Menüde Görünüyor' : 'Menüden Gizlendi'}
                        </span>
                      </div>
                      <button 
                        onClick={() => onToggleNavTab && onToggleNavTab(cat.id)}
                        style={{ background: isVisible ? '#16a34a' : '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{isVisible ? 'AÇIK' : 'GİZLİ'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUB-SECTION 2: ANA SAYFA BÖLÜM AYARLARI */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Settings size={22} color="#06b6d4" />
                <span>ANA SAYFA BÖLÜMLERİ GÖRÜNÜRLÜK AYARLARI</span>
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
                Ana sayfanızdaki büyük blokları dilediğiniz gibi **Açabilir (Göster)** veya **Kapatabilirsiniz (Siteden Gizle)**.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {/* TOGGLE HERO */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: sectionVisibility.showHero ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>Ana Manşet Bölümü</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ana Manşet Haber Kartı</span>
                  </div>
                  <button 
                    onClick={() => onToggleSection('showHero')}
                    style={{ background: sectionVisibility.showHero ? '#16a34a' : '#ef4444', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sectionVisibility.showHero ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{sectionVisibility.showHero ? 'AÇIK (Görünüyor)' : 'GİZLİ (Kapatıldı)'}</span>
                  </button>
                </div>

                {/* TOGGLE YAZARLAR */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: sectionVisibility.showYazarlar ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>Ekibimiz Bölümü</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Akademik Kadro ve Ekibimiz</span>
                  </div>
                  <button 
                    onClick={() => onToggleSection('showYazarlar')}
                    style={{ background: sectionVisibility.showYazarlar ? '#16a34a' : '#ef4444', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sectionVisibility.showYazarlar ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{sectionVisibility.showYazarlar ? 'AÇIK (Görünüyor)' : 'GİZLİ (Kapatıldı)'}</span>
                  </button>
                </div>

                {/* TOGGLE E-DERGİ */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: sectionVisibility.showEDergi ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>E-Dergi Arşivi Bölümü</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Dijital Dergi Sayıları Arşivi</span>
                  </div>
                  <button 
                    onClick={() => onToggleSection('showEDergi')}
                    style={{ background: sectionVisibility.showEDergi ? '#16a34a' : '#ef4444', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sectionVisibility.showEDergi ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{sectionVisibility.showEDergi ? 'AÇIK (Görünüyor)' : 'GİZLİ (Kapatıldı)'}</span>
                  </button>
                </div>

                {/* TOGGLE EDITORIAL FEED (MAKALELER SEKSİYONU) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: sectionVisibility.showEditorialFeed !== false ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>Son Eklenen Makaleler Bölümü</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Makale Kartları ve Analizler Akışı</span>
                  </div>
                  <button 
                    onClick={() => onToggleSection('showEditorialFeed')}
                    style={{ background: sectionVisibility.showEditorialFeed !== false ? '#16a34a' : '#ef4444', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sectionVisibility.showEditorialFeed !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{sectionVisibility.showEditorialFeed !== false ? 'AÇIK (Görünüyor)' : 'GİZLİ (Kapatıldı)'}</span>
                  </button>
                </div>

                {/* TOGGLE TICKER */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', background: sectionVisibility.showTicker ? '#f0fdf4' : '#fef2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>Kayan Son Gelişmeler Bandı</h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Üst Kayan Haber Bandı</span>
                  </div>
                  <button 
                    onClick={() => onToggleSection('showTicker')}
                    style={{ background: sectionVisibility.showTicker ? '#16a34a' : '#ef4444', color: 'white', padding: '8px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {sectionVisibility.showTicker ? <Eye size={15} /> : <EyeOff size={15} />}
                    <span>{sectionVisibility.showTicker ? 'AÇIK (Görünüyor)' : 'GİZLİ (Kapatıldı)'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 0: KAYITLI ÜYELER LİSTESİ */}
        {activeTab === 'uyeler' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0 }}>
                  SİTEDE KAYITLI OKUYUCULAR VE ÜYE BİLGİLERİ ({(liveUsersList || registeredUsersList).length})
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Sitede hesap oluşturan tüm okuyucuların iletişim verileri, şifreleri ve kayıt tarihleri canlı olarak burada listelenir.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={fetchLiveUsersFromCloud}
                  style={{ background: '#0284c7', color: 'white', padding: '10px 16px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={15} />
                  <span>Canlı Listeyi Yenile</span>
                </button>

                <button 
                  onClick={handleExportUsersCSV}
                  style={{ background: '#16a34a', color: 'white', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} />
                  <span>Üye Listesini İndir (CSV / Excel)</span>
                </button>
              </div>
            </div>

            {(liveUsersList || registeredUsersList).length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>Henüz kayıtlı okuyucu bulunmamaktadır.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0b132b', color: 'white', fontSize: '0.82rem' }}>
                      <th style={{ padding: '12px 16px' }}>AD SOYAD</th>
                      <th style={{ padding: '12px 16px' }}>E-POSTA ADRESİ</th>
                      <th style={{ padding: '12px 16px' }}>DOĞRULAMA DURUMU</th>
                      <th style={{ padding: '12px 16px' }}>TELEFON NUMARASI</th>
                      <th style={{ padding: '12px 16px' }}>İLGİ ALANLARI</th>
                      <th style={{ padding: '12px 16px' }}>KAYIT TARİHİ VE SAATİ</th>
                      <th style={{ padding: '12px 16px' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(liveUsersList || registeredUsersList).map((user, idx) => (
                      <tr key={user.id || idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.88rem', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>{user.fullName}</td>
                        <td style={{ padding: '14px 16px', color: '#0284c7', fontWeight: '700' }}>{user.email}</td>
                        <td style={{ padding: '14px 16px' }}>
                          {user.isVerified !== false ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> DOĞRULANMIŞ ÜYE
                            </span>
                          ) : (
                            <span style={{ background: '#fefce8', color: '#a16207', border: '1px solid #fef08a', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              🟡 BEKLEMEDE (KOD GÖNDERİLDİ)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>{user.phone}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {user.interests}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#16a34a', fontWeight: '700', fontSize: '0.82rem' }}>{user.registeredAt}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button 
                            onClick={() => {
                              if (confirm(`"${user.fullName || user.email}" kullanıcısını üye listesinden ve buluttan kalıcı olarak silmek istediğinize emin misiniz?`)) {
                                const currentList = liveUsersList || registeredUsersList;
                                const filtered = currentList.filter(u => u.email !== user.email && u.id !== user.id);
                                setLiveUsersList(filtered);
                                localStorage.setItem('pikam_registered_users', JSON.stringify(filtered));
                                if (onDeleteUser) {
                                  onDeleteUser(user.id, user.email);
                                }
                              }
                            }}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: MAKALE LİSTESİ VE SIRALAMA */}
        {activeTab === 'makale_listesi' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0 }}>
                  SİTEDE YAYINLANAN MAKALELER, SIRALAMA VE GİZLEME YÖNETİMİ
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Yayınlanan tüm makalelerin sırasını değiştirebilir (Yukarı / Aşağı Taşı), düzenleyebilir, gizleyebilir veya silebilirsiniz.
                </p>
              </div>

              <button 
                onClick={() => { setActiveTab('makale'); cancelEditArticle(); }}
                style={{ background: '#0b132b', color: 'white', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PlusCircle size={16} />
                <span>Yeni Makale Ekle</span>
              </button>
            </div>

            {articlesList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>Henüz yayınlanmış bir makale bulunmamaktadır.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {articlesList.map((art, idx) => (
                  <div key={art.id} style={{ border: art.hidden ? '2px dashed #94a3b8' : '1px solid #e2e8f0', opacity: art.hidden ? 0.65 : 1, borderRadius: '8px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ position: 'relative', height: '140px' }}>
                        <img src={art.image} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: art.categoryColor || '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>
                          {art.category}
                        </span>
                        {art.hidden && (
                          <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#000000', color: '#fef08a', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EyeOff size={12} /> SİTEDEN GİZLENDİ
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#0f172a', margin: '0 0 6px 0', lineHeight: '1.3' }}>{art.title}</h4>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{art.excerpt}</p>
                        <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '600' }}>
                          Yazar: {typeof art.author === 'string' ? art.author : art.author?.name} | {art.date || 'Bugün'}
                        </div>
                      </div>
                    </div>

                    {/* CONTROL ACTION BUTTONS: DÜZENLE, SIRALA, GİZLE/GÖSTER, SİL */}
                    <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => startEditArticle(art)}
                          style={{ flex: 1, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Edit3 size={13} /> Düzenle
                        </button>

                        <button 
                          onClick={() => onToggleHideArticle(art.id)}
                          style={{ flex: 1, background: art.hidden ? '#dcfce7' : '#fef3c7', color: art.hidden ? '#15803d' : '#b45309', border: '1px solid #fde68a', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          {art.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                          <span>{art.hidden ? 'Göster' : 'Gizle'}</span>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          disabled={idx === 0}
                          onClick={() => onMoveArticleUp(idx)}
                          style={{ flex: 1, background: idx === 0 ? '#f1f5f9' : '#ffffff', color: idx === 0 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <ArrowUp size={13} /> Yukarı Taşı
                        </button>

                        <button 
                          disabled={idx === articlesList.length - 1}
                          onClick={() => onMoveArticleDown(idx)}
                          style={{ flex: 1, background: idx === articlesList.length - 1 ? '#f1f5f9' : '#ffffff', color: idx === articlesList.length - 1 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === articlesList.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <ArrowDown size={13} /> Aşağı Taşı
                        </button>

                        <button 
                          onClick={() => {
                            if (confirm(`"${art.title}" makalesini siteden tamamen silmek istediğinize emin misiniz?`)) {
                              onDeleteArticle(art.id);
                            }
                          }}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} /> Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: E-DERGİ PDF YÜKLEME FORMU */}
        {activeTab === 'edergi' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Upload size={22} color="#0284c7" />
              <span>YENİ DİJİTAL DERGİ SAYISI VE PDF YÜKLE</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              PİKAM Dergi'nin yeni dijital sayısını PDF dosyası ve kapak fotoğrafı ile saniyeler içinde yayına alabilirsiniz.
            </p>

            <form onSubmit={handlePublishEDergi} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SAYI NUMARASI *</label>
                  <input 
                    type="text" 
                    value={issueNumber} 
                    onChange={(e) => setIssueNumber(e.target.value)} 
                    placeholder="Örn: Sayı 75" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAYIN DÖNEMİ / AY YIL *</label>
                  <input 
                    type="text" 
                    value={monthYear} 
                    onChange={(e) => setMonthYear(e.target.value)} 
                    placeholder="Örn: Ağustos 2026" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SAYFA SAYISI</label>
                  <input 
                    type="number" 
                    value={pageCount} 
                    onChange={(e) => setPageCount(e.target.value)} 
                    placeholder="68" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SAYI ANA KAPAĞI VE TEMA BAŞLIĞI *</label>
                <input 
                  type="text" 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)} 
                  placeholder="Örn: Doğu Akdeniz Enerji Denklemi ve Jeopolitik" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  DERGİ KAPAK FOTOĞRAFI (ÖZEL GÖRSEL YÜKLEYİN VEYA PDF İLK SAYFASI OTOMATİK KULLANILIR)
                </label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {coverImage ? (
                    <img src={coverImage} alt="Dergi Kapak Önizleme" style={{ width: '90px', height: '120px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #0284c7', boxShadow: '0 4px 10px rgba(0,0,0,0.15)' }} />
                  ) : (
                    <div style={{ width: '90px', height: '120px', background: '#f1f5f9', borderRadius: '6px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', textAlign: 'center', padding: '6px' }}>
                      <span>Kapak Önizleme</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setCoverImage(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }} 
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                    />
                    <input 
                      type="url" 
                      placeholder="veya Özel Kapak Görsel Web Bağlantısı (https://...)" 
                      value={coverImage} 
                      onChange={(e) => setCoverImage(e.target.value)} 
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                    <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      PDF yüklediğinizde 1. Sayfa otomatik kapak olur; dilerseniz buradan kendiniz de özel kapak fotoğrafı yükleyebilirsiniz.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  DERGİ PDF DOSYASI (BİLGİSAYARINIZDAN SEÇİN) *
                </label>
                <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc', textAlign: 'center' }}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPdfFile(file);
                        setPdfFileName(file.name);
                        setIsPdfProcessing(true);

                        const fReader = new FileReader();
                        fReader.onload = (ev) => setPdfDataUrl(ev.target.result);
                        fReader.readAsDataURL(file);

                        try {
                          const result = await processPdfFile(file);
                          if (result.pageCount) setPageCount(result.pageCount);
                          if (result.coverImage) setCoverImage(result.coverImage);
                          if (result.pagesDataUrls) setPagesDataUrls(result.pagesDataUrls);
                        } catch (err) {
                          console.error('PDF process error:', err);
                        } finally {
                          setIsPdfProcessing(false);
                        }
                      }
                    }} 
                    style={{ display: 'none' }}
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {isPdfProcessing ? <Loader2 size={32} className="animate-spin" color="#0284c7" /> : <Upload size={32} color="#0284c7" />}
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>
                      {isPdfProcessing ? 'PDF Sayfaları İşleniyor ve İlk Sayfa Kapak Olarak Ayarlanıyor...' : pdfFileName ? `Seçilen Dosya: ${pdfFileName}` : 'PDF Dosyası Yüklemek İçin Tıklayın (500MB Dosyalar Desteklenir)'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>PDF'in ilk sayfası otomatik kapak görseli yapılır ve tüm sayfalar interaktif okuyucuya aktarılır.</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>EDİTÖRDEN NOTU</label>
                <textarea 
                  rows="3" 
                  value={editorNote} 
                  onChange={(e) => setEditorNote(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div>
                <button 
                  type="submit" 
                  disabled={isPublishing}
                  style={{ background: '#0b132b', color: 'white', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>SİTEDE YAYINLANIYOR...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} color="#38bdf8" />
                      <span>YENİ DERGİ SAYISINI SİTEDE YAYINLA</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: YAYINLANMIŞ DERGİ SAYILARI LİSTESİ */}
        {activeTab === 'arsiv' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0 }}>
                  SİTEDE YAYINDA OLAN DERGİ SAYILARI VE YÖNETİMİ
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Yayınlanan dergi sayılarını Düzenleyebilir, Sıralayabilir (Yukarı/Aşağı), Gizleyebilir veya Silebilirsiniz.
                </p>
              </div>

              <button 
                onClick={() => { setActiveTab('edergi'); cancelEditIssue(); }}
                style={{ background: '#0b132b', color: 'white', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PlusCircle size={16} />
                <span>Yeni Dergi Sayısı Ekle</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {eDergiList.map((issue, idx) => (
                <div key={issue.id} style={{ border: issue.hidden ? '2px dashed #cbd5e1' : '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: issue.hidden ? '#f1f5f9' : '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ padding: '16px', display: 'flex', gap: '14px', position: 'relative' }}>
                    <img src={issue.coverImage} alt={issue.monthYear} style={{ width: '85px', height: '115px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', opacity: issue.hidden ? 0.6 : 1 }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>{issue.issueNumber}</span>
                        {issue.hidden && (
                          <span style={{ background: '#000000', color: '#fef08a', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <EyeOff size={11} /> GİZLİ
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: '#0f172a', margin: '6px 0 4px 0' }}>{issue.monthYear}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{issue.theme}"</p>
                    </div>
                  </div>

                  {/* ACTION CONTROLS: DÜZENLE, GİZLE/GÖSTER, SIRALA, SİL */}
                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => startEditIssue(issue)}
                        style={{ flex: 1, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Edit3 size={13} /> Düzenle
                      </button>

                      <button 
                        onClick={() => onToggleHideEDergi && onToggleHideEDergi(issue.id)}
                        style={{ flex: 1, background: issue.hidden ? '#dcfce7' : '#fef3c7', color: issue.hidden ? '#15803d' : '#b45309', border: '1px solid #fde68a', padding: '6px 8px', borderRadius: '4px', fontSize: '0.76rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        {issue.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span>{issue.hidden ? 'Göster' : 'Gizle'}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        disabled={idx === 0}
                        onClick={() => onMoveEDergiUp && onMoveEDergiUp(idx)}
                        style={{ flex: 1, background: idx === 0 ? '#f1f5f9' : '#ffffff', color: idx === 0 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <ArrowUp size={13} /> Yukarı
                      </button>

                      <button 
                        disabled={idx === eDergiList.length - 1}
                        onClick={() => onMoveEDergiDown && onMoveEDergiDown(idx)}
                        style={{ flex: 1, background: idx === eDergiList.length - 1 ? '#f1f5f9' : '#ffffff', color: idx === eDergiList.length - 1 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', padding: '5px 6px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '600', cursor: idx === eDergiList.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <ArrowDown size={13} /> Aşağı
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm(`"${issue.issueNumber} (${issue.monthYear})"` + ' sayısını siteden tamamen kaldırmak istediğinize emin misiniz?')) {
                            onDeleteEDergi(issue.id);
                          }
                        }}
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '5px 8px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: YENİ MAKALE EKLEME VE DÜZENLEME FORMU */}
        {activeTab === 'makale' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0 }}>
                {editingArticleId ? 'MAKALEYİ DÜZENLE VE GÜNCELLE' : 'YENİ MAKALE VEYA RAPOR YAYINLA'}
              </h2>

              {editingArticleId && (
                <button onClick={cancelEditArticle} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <X size={14} /> Düzenlemeyi İptal Et
                </button>
              )}
            </div>

            <form onSubmit={handlePublishArticle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MAKALE BAŞLIĞI *</label>
                <input 
                  type="text" 
                  value={artTitle} 
                  onChange={(e) => setArtTitle(e.target.value)} 
                  placeholder="Makalenin ana başlığını girin..." 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: '700' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KATEGORİ</label>
                  <select 
                    value={artCategory} 
                    onChange={(e) => setArtCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  >
                    <option value="POLİTİKA">POLİTİKA</option>
                    <option value="EKONOMİ">EKONOMİ</option>
                    <option value="FİNANS">FİNANS</option>
                    <option value="KÜLTÜR SANAT">KÜLTÜR SANAT</option>
                    <option value="STRATEJİ">STRATEJİ</option>
                    <option value="TEKNOLOJİ">TEKNOLOJİ</option>
                    <option value="DÜNYA">DÜNYA</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR / ANALİST *</label>
                  <input 
                    type="text" 
                    value={artAuthor} 
                    onChange={(e) => setArtAuthor(e.target.value)} 
                    placeholder="Prof. Dr. Ahmet Yılmaz" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAYIN TARİHİ (MANUEL)</label>
                  <input 
                    type="text" 
                    value={artDate} 
                    onChange={(e) => setArtDate(e.target.value)} 
                    placeholder="Örn: 29 Temmuz 2026" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  MAKALE KAPAK FOTOĞRAFI (DOSYADAN SEÇ VEYA WEB BAĞLANTISI YAPIŞTIR)
                </label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {artImage ? (
                    <img src={artImage} alt="Makale Kapak Önizleme" style={{ width: '120px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #0284c7' }} />
                  ) : (
                    <div style={{ width: '120px', height: '75px', background: '#f1f5f9', borderRadius: '6px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                      <span>Varsayılan</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleArticleImageUpload} 
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
                    />
                    <input 
                      type="url" 
                      placeholder="veya Görsel Web Bağlantısı (https://...)" 
                      value={artImage} 
                      onChange={(e) => setArtImage(e.target.value)} 
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0b132b' }}>ÖZET VE MAKALE METNİ (GENİŞ YAZI ALANI) *</label>
                  <span style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: '600' }}>💡 Çift Enter ile yeni paragraf oluşturabilirsiniz</span>
                </div>
                <textarea 
                  rows="16" 
                  value={artExcerpt} 
                  onChange={(e) => setArtExcerpt(e.target.value)} 
                  placeholder="Makalenizin tüm özet ve detay metnini buraya girin veya düzenleyin..." 
                  required
                  style={{ 
                    width: '100%', 
                    minHeight: '380px', 
                    padding: '14px 18px', 
                    borderRadius: '8px', 
                    border: '2px solid #0284c7', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.65', 
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)'
                  }}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isPublishing}
                style={{ background: editingArticleId ? '#16a34a' : '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {editingArticleId ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                <span>{editingArticleId ? 'MAKALEYİ GÜNCELLE VE YAYINLA' : 'MAKALEYİ YAYINLA'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
