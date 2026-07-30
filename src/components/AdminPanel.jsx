import React, { useState, useEffect } from 'react';
import { Lock, LogOut, PlusCircle, BookOpen, FileText, CheckCircle2, Trash2, Upload, ShieldCheck, Eye, Loader2, Users, Download, Image as ImageIcon, Newspaper, Feather, EyeOff, Settings, Edit3, Layout, X, ArrowUp, ArrowDown, MessageSquare, Compass, Info, AlignLeft, StickyNote, CheckSquare, Square, AlertCircle, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

import { processPdfFile } from '../lib/pdfHelper';

export default function AdminPanel({ 
  eDergiList, onAddEDergi, onUpdateEDergi, onToggleHideEDergi, onMoveEDergiUp, onMoveEDergiDown, onDeleteEDergi, 
  onAddArticle, onUpdateArticle, onToggleHideArticle, onMoveArticleUp, onMoveArticleDown, articlesList, onDeleteArticle, 
  registeredUsersList, onDeleteUser,
  authorsList, onAddAuthor, onDeleteAuthor, onUpdateAuthor, onMoveAuthorUp, onMoveAuthorDown,
  heroFeatured, onUpdateHeroFeatured,
  sectionVisibility, onToggleSection,
  navVisibility = {}, onToggleNavTab,
  kunyeData = {}, onUpdateKunye,
  allCommentsList = [], onDeleteComment,
  adminNotesList = [], onAddNote, onUpdateNote, onToggleCompleteNote, onDeleteNote,
  onForceSyncCloud
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('uyeler');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  // Künye Edit Form State
  const [kunyeSahip, setKunyeSahip] = useState(kunyeData?.yayinSahibi || kunyeData?.imtiyazSahibi || 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) A.Ş.');
  const [kunyeYonetmen, setKunyeYonetmen] = useState(kunyeData?.yayinYonetmeni || kunyeData?.genelYayinYonetmeni || 'Prof. Dr. Osman Bahtiyar');
  const [kunyeEditor, setKunyeEditor] = useState(kunyeData?.sorumluYaziIsleri || kunyeData?.editor || 'Doç. Dr. Selin Aksoy');
  const [kunyeGrafik, setKunyeGrafik] = useState(kunyeData?.grafikTasarim || 'PİKAM Dijital Yayıncılık Servisi');
  const [kunyeDanisma, setKunyeDanisma] = useState(Array.isArray(kunyeData?.akademikDanismaKurulu) ? kunyeData.akademikDanismaKurulu.join(', ') : (kunyeData?.akademikDanismaKurulu || 'Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir'));
  const [kunyeAdres, setKunyeAdres] = useState(kunyeData?.iletisim?.adres || kunyeData?.adres || 'PİKAM Genel Merkezi, Ankara / Türkiye');
  const [kunyeTelefon, setKunyeTelefon] = useState(kunyeData?.iletisim?.telefon || kunyeData?.telefon || '+90 (312) 400 00 00');
  const [kunyeEposta, setKunyeEposta] = useState(kunyeData?.iletisim?.eposta || kunyeData?.eposta || 'info@pikamdergi.com');
  const [kunyeWeb, setKunyeWeb] = useState(kunyeData?.iletisim?.web || kunyeData?.web || 'www.pikamtr.com');

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
      setKunyeYonetmen(kunyeData.yayinYonetmeni || kunyeData.genelYayinYonetmeni || 'Prof. Dr. Osman Bahtiyar');
      setKunyeEditor(kunyeData.sorumluYaziIsleri || kunyeData.editor || 'Doç. Dr. Selin Aksoy');
      setKunyeGrafik(kunyeData.grafikTasarim || 'PİKAM Dijital Yayıncılık Servisi');
      setKunyeDanisma(Array.isArray(kunyeData.akademikDanismaKurulu) ? kunyeData.akademikDanismaKurulu.join(', ') : (kunyeData.akademikDanismaKurulu || 'Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir'));
      setKunyeAdres(kunyeData.iletisim?.adres || kunyeData.adres || 'PİKAM Genel Merkezi, Ankara / Türkiye');
      setKunyeTelefon(kunyeData.iletisim?.telefon || kunyeData.telefon || '+90 (312) 400 00 00');
      setKunyeEposta(kunyeData.iletisim?.eposta || kunyeData.eposta || 'info@pikamdergi.com');
      setKunyeWeb(kunyeData.iletisim?.web || kunyeData.web || 'www.pikamtr.com');
    }
  }, [kunyeData]);

  const processPermanentImage = async (file) => {
    if (!file) return null;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage.from('pikam-images').upload(filePath, file);

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('pikam-images').getPublicUrl(filePath);
        if (urlData && urlData.publicUrl) {
          return urlData.publicUrl;
        }
      }
    } catch (err) {
      console.log('Supabase storage fallback to Base64 Data URL:', err);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
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
    if (username === 'admin' && password === 'pikam2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre! (Varsayılan: admin / pikam2026)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
      yayinYonetmeni: kunyeYonetmen,
      genelYayinYonetmeni: kunyeYonetmen,
      sorumluYaziIsleri: kunyeEditor,
      editor: kunyeEditor,
      grafikTasarim: kunyeGrafik,
      akademikDanismaKurulu: kunyeDanisma.split(',').map(s => s.trim()).filter(Boolean),
      iletisim: {
        adres: kunyeAdres,
        telefon: kunyeTelefon,
        eposta: kunyeEposta,
        web: kunyeWeb
      }
    };

    if (onUpdateKunye) onUpdateKunye(updatedKunye);
    setSuccessMsg('PİKAM Dergi Künye ve Kurumsal Bilgileri başarıyla güncellendi ve sitede yayına alındı!');
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
                placeholder="admin" 
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
                placeholder="••••••••" 
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

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.78rem', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            Varsayılan Giriş: <strong>admin</strong> / <strong>pikam2026</strong>
          </div>
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
              if (onForceSyncCloud) {
                await onForceSyncCloud();
              }
              setIsSyncingAll(false);
              setSuccessMsg('✓ Bütün E-Dergiler, Makaleler, Kadro ve Ayarlar Supabase Bulut Veritabanı ile tam senkronize edildi! Tüm cihazlarda ve sitede yayında.');
              setTimeout(() => setSuccessMsg(''), 7000);
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
            onClick={() => { setActiveTab('makale'); cancelEditArticle(); }} 
            style={{ background: activeTab === 'makale' ? '#0b132b' : '#ffffff', color: activeTab === 'makale' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={15} />
            <span>Yeni Makale Ekle</span>
          </button>
        </div>

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
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAYIN / İMTİYAZ SAHİBİ *</label>
                <input 
                  type="text" 
                  value={kunyeSahip} 
                  onChange={(e) => setKunyeSahip(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>GENEL YAYIN YÖNETMENİ *</label>
                <input 
                  type="text" 
                  value={kunyeYonetmen} 
                  onChange={(e) => setKunyeYonetmen(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SORUMLU YAZI İŞLERİ MÜDÜRÜ / EDITÖR *</label>
                <input 
                  type="text" 
                  value={kunyeEditor} 
                  onChange={(e) => setKunyeEditor(e.target.value)} 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>TASARIM VE GRAFİK MİMARİSİ</label>
                <input 
                  type="text" 
                  value={kunyeGrafik} 
                  onChange={(e) => setKunyeGrafik(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>AKADEMİK DANIŞMA VE HAKEM KURULU (Virgülle Ayırın)</label>
                <input 
                  type="text" 
                  value={kunyeDanisma} 
                  onChange={(e) => setKunyeDanisma(e.target.value)} 
                  placeholder="Prof. Dr. Ahmet Yılmaz, Dr. Murat Karahan, Zeynep Demir"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ADRES</label>
                <input 
                  type="text" 
                  value={kunyeAdres} 
                  onChange={(e) => setKunyeAdres(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>TELEFON NUMARASI</label>
                <input 
                  type="text" 
                  value={kunyeTelefon} 
                  onChange={(e) => setKunyeTelefon(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>E-POSTA ADRESİ</label>
                <input 
                  type="text" 
                  value={kunyeEposta} 
                  onChange={(e) => setKunyeEposta(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>WEB ADRESİ</label>
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

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SON ANALİZ / ESER BAŞLIĞI</label>
                  <input 
                    type="text" 
                    value={authorLatest} 
                    onChange={(e) => setAuthorLatest(e.target.value)} 
                    placeholder="Doğu Akdeniz Enerji Denklemi" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', margin: 0 }}>
                  SİTEDE KAYITLI OKUYUCULAR VE ÜYE BİLGİLERİ
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Sitede hesap oluşturan okuyucuların iletişim verileri ve kayıt tarihleri burada biriktirilir.
                </p>
              </div>

              <button 
                onClick={handleExportUsersCSV}
                style={{ background: '#16a34a', color: 'white', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} />
                <span>Üye Listesini İndir (CSV / Excel)</span>
              </button>
            </div>

            {registeredUsersList.length === 0 ? (
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
                      <th style={{ padding: '12px 16px' }}>TELEFON NUMARASI</th>
                      <th style={{ padding: '12px 16px' }}>İLGİ ALANLARI</th>
                      <th style={{ padding: '12px 16px' }}>KAYIT TARİHİ VE SAATİ</th>
                      <th style={{ padding: '12px 16px' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsersList.map((user, idx) => (
                      <tr key={user.id || idx} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '0.88rem', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#0f172a' }}>{user.fullName}</td>
                        <td style={{ padding: '14px 16px', color: '#0284c7' }}>{user.email}</td>
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
                              if (confirm(`"${user.fullName}" kullanıcısını üye listesinden kaldırmak istediğinize emin misiniz?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
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
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ÖZET VE İÇERİK *</label>
                <textarea 
                  rows="4" 
                  value={artExcerpt} 
                  onChange={(e) => setArtExcerpt(e.target.value)} 
                  placeholder="Makalenin ana özet metnini buraya girin..." 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
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
