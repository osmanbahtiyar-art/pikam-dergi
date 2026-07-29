import React, { useState, useEffect } from 'react';
import { Lock, LogOut, PlusCircle, BookOpen, FileText, CheckCircle2, Trash2, Upload, ShieldCheck, Eye, Loader2, Users, Download, Image as ImageIcon, Newspaper, Feather, EyeOff, Settings, Edit3, Layout, X, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel({ 
  eDergiList, onAddEDergi, onDeleteEDergi, 
  onAddArticle, onUpdateArticle, onToggleHideArticle, onMoveArticleUp, onMoveArticleDown, articlesList, onDeleteArticle, 
  registeredUsersList, onDeleteUser,
  authorsList, onAddAuthor, onDeleteAuthor, onUpdateAuthor,
  heroFeatured, onUpdateHeroFeatured,
  sectionVisibility, onToggleSection
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('uyeler');
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // E-Dergi Form State
  const [issueNumber, setIssueNumber] = useState('Sayı 75');
  const [monthYear, setMonthYear] = useState('Ağustos 2026');
  const [theme, setTheme] = useState('Doğu Akdeniz ve Yeni Enerji Geopolitiği');
  const [pageCount, setPageCount] = useState(72);
  const [coverImage, setCoverImage] = useState('/pikam_kapak_temmuz_1784839785714.jpg');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [editorNote, setEditorNote] = useState('PİKAM 75. sayımızda Doğu Akdeniz enerji koridorları ve küresel makroekonomi masaya yatırılıyor.');

  // Article Form & Edit State
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('POLİTİKA');
  const [artAuthor, setArtAuthor] = useState('Prof. Dr. Ahmet Yılmaz');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artImage, setArtImage] = useState('');

  // Author Form & Edit State
  const [editingAuthorId, setEditingAuthorId] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [authorAffiliation, setAuthorAffiliation] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [authorLatest, setAuthorLatest] = useState('');

  // Hero Main Featured CMS Form State
  const [heroTitle, setHeroTitle] = useState(heroFeatured?.title || '');
  const [heroSubtitle, setHeroSubtitle] = useState(heroFeatured?.subtitle || '');
  const [heroCategory, setHeroCategory] = useState(heroFeatured?.category || 'EKONOMİ & STRATEJİ');
  const [heroImage, setHeroImage] = useState(heroFeatured?.image || '/hero_ekonomi_jeopolitik_1784839785714.jpg');
  const [heroAuthorName, setHeroAuthorName] = useState(heroFeatured?.author?.name || 'Prof. Dr. Ahmet Yılmaz');
  const [heroAuthorTitle, setHeroAuthorTitle] = useState(heroFeatured?.author?.title || 'PİKAM Ekonomi Araştırmaları Direktörü');
  const [heroReadTime, setHeroReadTime] = useState(heroFeatured?.readTime || '8 Dakika Okuma');

  useEffect(() => {
    const savedAuth = localStorage.getItem('pikam_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === 'admin' && password.trim() === 'pikam2026') {
      setIsAuthenticated(true);
      localStorage.setItem('pikam_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Hatalı kullanıcı adı veya şifre! (Varsayılan: admin / pikam2026)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pikam_admin_auth');
  };

  const processPermanentImage = async (file) => {
    if (!file) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `pikam_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('pikam-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('pikam-images')
          .getPublicUrl(fileName);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.log('Supabase storage upload notice:', err);
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setPdfFile(file);
        setPdfFileName(file.name);
      } else if (file.type.startsWith('image/')) {
        const permUrl = await processPermanentImage(file);
        setCoverImage(permUrl);
      }
    }
  };

  const handleArticleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const permUrl = await processPermanentImage(file);
      setArtImage(permUrl);
    }
  };

  const handleAuthorAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const permUrl = await processPermanentImage(file);
      setAuthorAvatar(permUrl);
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const permUrl = await processPermanentImage(file);
      setHeroImage(permUrl);
    }
  };

  const startEditArticle = (article) => {
    setEditingArticleId(article.id);
    setArtTitle(article.title || '');
    setArtCategory(article.category || 'POLİTİKA');
    setArtAuthor(typeof article.author === 'string' ? article.author : article.author?.name || 'Prof. Dr. Ahmet Yılmaz');
    setArtExcerpt(article.excerpt || '');
    setArtImage(article.image || '');
    setActiveTab('makale');
  };

  const cancelEditArticle = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtCategory('POLİTİKA');
    setArtAuthor('Prof. Dr. Ahmet Yılmaz');
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
      setSuccessMsg(`"${authorName}" yazarının bilgileri başarıyla güncellendi!`);
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
      setSuccessMsg(`"${authorName}" yazarı kadroya eklendi ve sitede yayınlandı!`);
      cancelEditAuthor();
    }

    setTimeout(() => setSuccessMsg(''), 7000);
  };

  const handlePublishEDergi = async (e) => {
    e.preventDefault();
    if (!issueNumber || !monthYear || !theme) return;

    setIsPublishing(true);

    let pdfUrl = '/pikam_kapak_temmuz_1784839785714.jpg';

    if (pdfFile) {
      try {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData } = await supabase.storage
          .from('edergi-pdfs')
          .upload(fileName, pdfFile);

        if (uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('edergi-pdfs')
            .getPublicUrl(fileName);
          
          if (publicUrlData?.publicUrl) {
            pdfUrl = publicUrlData.publicUrl;
          }
        }
      } catch (err) {
        console.log('Storage upload fallback:', err);
      }
    }

    const newIssue = {
      id: `ed-${Date.now()}`,
      issueNumber,
      monthYear,
      theme,
      coverImage: coverImage || '/pikam_kapak_temmuz_1784839785714.jpg',
      pdfUrl: pdfUrl,
      pageCount: Number(pageCount) || 68,
      pages: [
        { page: 1, title: 'Kapak', subtitle: `${monthYear} Öne Çıkanlar` },
        { page: 2, title: 'Editörden', content: editorNote },
        { page: 3, title: 'İçindekiler & Yayın Kurulu', content: '04-20 Küresel Ticaret | 21-40 Enerji Jeopolitiği | 41-72 Yapay Zeka Doktrini' }
      ]
    };

    try {
      await supabase.from('e_dergi_issues').insert([newIssue]);
    } catch (err) {
      console.log('Supabase sync notice:', err);
    }

    onAddEDergi(newIssue);

    setIsPublishing(false);
    setSuccessMsg(`"${issueNumber} (${monthYear}) - ${theme}" başarıyla pikamdergi.com sitesinde yayınlandı!`);
    
    setPdfFile(null);
    setPdfFileName('');
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

    if (editingArticleId) {
      // UPDATE EXISTING ARTICLE
      const updatedArt = {
        id: editingArticleId,
        category: artCategory,
        categoryColor: categoryColors[artCategory] || '#ef4444',
        title: artTitle,
        excerpt: artExcerpt,
        author: artAuthor,
        date: 'Bugün (Düzenlendi)',
        readTime: '6 Dakika',
        image: finalImage,
        content: `<p>${artExcerpt}</p><p>Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz.</p>`
      };
      onUpdateArticle(updatedArt);
      setSuccessMsg(`"${artTitle}" makalesi başarıyla güncellendi!`);
      cancelEditArticle();
    } else {
      // ADD NEW ARTICLE
      const newArt = {
        id: `art-${Date.now()}`,
        category: artCategory,
        categoryColor: categoryColors[artCategory] || '#ef4444',
        title: artTitle,
        excerpt: artExcerpt,
        author: artAuthor,
        date: 'Bugün',
        readTime: '6 Dakika',
        image: finalImage,
        content: `<p>${artExcerpt}</p><p>Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz.</p>`
      };
      onAddArticle(newArt);
      setSuccessMsg(`"${artTitle}" makalesi kapak görseliyle birlikte saniyeler içinde sitede yayına girdi!`);
      cancelEditArticle();
    }

    setIsPublishing(false);
    setTimeout(() => setSuccessMsg(''), 7000);
  };

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b132b', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ background: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '12px', padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '75px', height: '75px', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', color: '#0b132b' }}>PİKAM YÖNETİM PANELSİ</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Editör ve Yayın Kurulu Girişi</p>
          </div>

          {loginError && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', marginBottom: '16px', borderLeft: '4px solid #dc2626' }}>
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
                placeholder="Örn: admin" 
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

  // LOGGED IN ADMIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* ADMIN HEADER */}
      <header style={{ background: '#0b132b', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/pikam_logo.png" alt="PİKAM Logo" style={{ width: '42px', height: '42px' }} />
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', letterSpacing: '1px', margin: 0 }}>
              PİKAM DERGİ GELİŞMİŞ CMS YÖNETİM PANELSİ
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>Tam Arayüz, Akış, Sıralama ve Gizleme Portalı (pikamdergi.com/admin)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
            <span>Yazarlar & Kadro ({authorsList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('site_ayarlari')} 
            style={{ background: activeTab === 'site_ayarlari' ? '#0b132b' : '#ffffff', color: activeTab === 'site_ayarlari' ? '#ffffff' : '#475569', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={15} color={activeTab === 'site_ayarlari' ? '#38bdf8' : '#06b6d4'} />
            <span>Bölüm Ayarları (Gizle/Göster)</span>
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

        {/* TAB: ANA SAYFA AKIŞI VE MANŞET HABERİ YÖNETİMİ */}
        {activeTab === 'manset_akis' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layout size={22} color="#10b981" />
              <span>ANA SAYFA ANA MANŞET HABERİNİ VE GÖRSELİNİ DÜZENLE</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Web sitenizin ana sayfasındaki en üstte büyük boyutta görünen **Ana Manşet** analizinin başlığını, alt başlığını ve manşet görselini buradan anında değiştirebilirsiniz.
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
                  <span>{editingAuthorId ? 'YAZAR BİLGİLERİNİ DÜZENLE' : 'YENİ YAZAR VEYA AKADEMİSYEN EKLE'}</span>
                </h2>

                {editingAuthorId && (
                  <button onClick={cancelEditAuthor} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <X size={14} /> Düzenlemeyi İptal Et
                  </button>
                )}
              </div>
              
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
                {editingAuthorId 
                  ? 'Seçilen yazarın isim, görev, uzmanlık alanı ve profil fotoğrafını buradan güncelleyebilirsiniz.' 
                  : 'Buradan ekleyeceğiniz yazarlar doğrudan web sitenizdeki "PİKAM YAZARLARI & AKADEMİK KADRO" bölümünde yayınlanır.'}
              </p>

              <form onSubmit={handleSaveAuthorForm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR ADI VE SOYADI *</label>
                  <input 
                    type="text" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    placeholder="Örn: Prof. Dr. Canan Yılmaz" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>GÖREVİ / UNVANI *</label>
                  <input 
                    type="text" 
                    value={authorRole} 
                    onChange={(e) => setAuthorRole(e.target.value)} 
                    placeholder="Örn: PİKAM Ekonomi Araştırmaları Direktörü" 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>UZMANLIK / UZMANLIK ALANI</label>
                  <input 
                    type="text" 
                    value={authorAffiliation} 
                    onChange={(e) => setAuthorAffiliation(e.target.value)} 
                    placeholder="Örn: İKTİSAT VE FİNANS ANA BİLİM DALI" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>SON ANALİZ / MAKALE BAŞLIĞI</label>
                  <input 
                    type="text" 
                    value={authorLatest} 
                    onChange={(e) => setAuthorLatest(e.target.value)} 
                    placeholder="Örn: Enflasyon Dinamikleri ve Para Politikası" 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR FOTOĞRAFI (DOSYADAN SEÇ VEYA WEB LINKI YAPIŞTIR)</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="Yazar Avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #8b5cf6' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <Feather size={20} />
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                      <input type="file" accept="image/*" onChange={handleAuthorAvatarUpload} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                      <input type="url" placeholder="veya Fotoğraf Web Bağlantısı (https://...)" value={authorAvatar} onChange={(e) => setAuthorAvatar(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                  <button type="submit" style={{ background: editingAuthorId ? '#16a34a' : '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingAuthorId ? <Edit3 size={16} /> : <PlusCircle size={16} />}
                    <span>{editingAuthorId ? 'YAZAR BİLGİLERİNİ GÜNCELLE VE KAYDET' : 'YAZARI SİTEDE YAYINLA'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* LIST: MEVCUT YAZARLAR VE DÜZENLE / SIL BUTONLARI */}
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.25rem', color: '#0b132b', marginBottom: '20px' }}>
                SİTEDE YAYINDA OLAN YAZARLAR ({authorsList.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                {authorsList.map((author) => (
                  <div key={author.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', textAlignment: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
                    <img src={author.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} alt={author.name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #8b5cf6' }} />
                    <h4 style={{ fontFamily: 'Playfair Display', fontSize: '1rem', color: '#0f172a', margin: '0 0 4px 0', textAlign: 'center' }}>{author.name}</h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 12px 0', textAlign: 'center' }}>{author.role}</p>
                    
                    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                      <button 
                        onClick={() => startEditAuthor(author)}
                        style={{ flex: 1, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Edit3 size={13} /> Düzenle
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`"${author.name}" yazarını siteden kaldırmak istediğinize emin misiniz?`)) {
                            onDeleteAuthor(author.id);
                          }
                        }}
                        style={{ flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: ARAYÜZ VE BÖLÜM AYARLARI (GİZLE / GÖSTER) */}
        {activeTab === 'site_ayarlari' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={22} color="#06b6d4" />
              <span>ARAYÜZ VE SİTE BÖLÜMÜ GÖRÜNÜRLÜK AYARLARI</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '28px' }}>
              Ana sayfanızdaki bölümleri dilediğiniz gibi **Açabilir (Göster)** veya **Kapatabilirsiniz (Siteden Gizle)**.
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
                  <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>PİKAM Yazarları Bölümü</h4>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Akademik Kadro ve Yazarlar</span>
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
        )}

        {/* TAB 0: KAYITLI ÜYELER LİSTESİ */}
        {activeTab === 'uyeler' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Users size={22} color="#0284c7" />
                  <span>SİTEDE KAYITLI OKUYUCULAR VE ÜYE BİLGİLERİ</span>
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '4px' }}>
                  Sitede hesap oluşturan okuyucuların iletişim verileri ve kayıt tarihleri burada biriktirilir.
                </p>
              </div>

              <button 
                onClick={handleExportUsersCSV}
                style={{ background: '#16a34a', color: 'white', padding: '10px 18px', borderRadius: '6px', fontWeight: '700', fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} /> Üye Listesini İndir (CSV / Excel)
              </button>
            </div>

            {registeredUsersList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>Henüz kayıtlı okuyucu bulunmamaktadır. Kullanıcılar üye oldukça verileri buraya eklenecektir.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0b132b', color: 'white' }}>
                      <th style={{ padding: '12px 14px', borderRadius: '4px 0 0 0' }}>AD SOYAD</th>
                      <th style={{ padding: '12px 14px' }}>E-POSTA ADRESİ</th>
                      <th style={{ padding: '12px 14px' }}>TELEFON NUMARASI</th>
                      <th style={{ padding: '12px 14px' }}>İLGİ ALANLARI</th>
                      <th style={{ padding: '12px 14px' }}>KAYIT TARIHI VE SAATI</th>
                      <th style={{ padding: '12px 14px', borderRadius: '0 4px 0 0', textAlign: 'center' }}>İŞLEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredUsersList.map((user, idx) => (
                      <tr key={user.id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#0f172a' }}>{user.fullName}</td>
                        <td style={{ padding: '12px 14px', color: '#0284c7' }}>{user.email}</td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>{user.phone}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>
                            {user.interests}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#16a34a', fontWeight: '700' }}>{user.registeredAt}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button 
                            onClick={() => {
                              if (confirm(`"${user.fullName}" kullanıcısını üye listesinden silmek istediğinize emin misiniz?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            <Trash2 size={12} /> Sil
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

        {/* TAB: YAYINLANMIŞ MAKALELER LİSTESİ, DÜZENLEME, SIRALAMA VE GİZLEME */}
        {activeTab === 'makale_listesi' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Newspaper size={22} color="#eab308" />
              <span>SİTEDE YAYINLANAN MAKALELERİ YÖNET, DÜZENLE, SIRALA VE GİZLE</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Makalelerin **başlığını, özetini ve resmini düzenleyebilir**, sırasını **yukarı/aşağı** taşıyabilir, **gizleyip gösterabilir** veya silebilirsiniz.
            </p>

            {articlesList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '1rem', color: '#64748b' }}>Henüz yayınlanmış makale bulunmamaktadır.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {articlesList.map((art, idx) => (
                  <div key={art.id} style={{ border: art.hidden ? '2px dashed #94a3b8' : '1px solid #e2e8f0', opacity: art.hidden ? 0.75 : 1, borderRadius: '8px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ position: 'relative', height: '140px' }}>
                        <img src={art.image} alt={art.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span style={{ position: 'absolute', top: '8px', left: '8px', background: art.categoryColor || '#10b981', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                          {art.category}
                        </span>

                        {art.hidden && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px', background: '#dc2626', color: 'white', fontSize: '0.7rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                            GİZLİ (Sitede Görünmüyor)
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
              Buradan yükleyeceğiniz dergi sayısı ve PDF dokümanı anında pikamdergi.com sitesindeki **E-Dergi Arşivi** bölümünde okuyuculara açılır.
            </p>

            <form onSubmit={handlePublishEDergi} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>DERGİ SAYI NUMARASI</label>
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
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>AY VE YIL</label>
                <input 
                  type="text" 
                  value={monthYear} 
                  onChange={(e) => setMonthYear(e.target.value)} 
                  placeholder="Örn: Ağustos 2026" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>DERGİ KAPAK TEMASI / BAŞLIĞI</label>
                <input 
                  type="text" 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value)} 
                  placeholder="Örn: Küresel Ticaret Savaşları ve Yapay Zeka Doktrini" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>PDF DOSYASI SEÇ</label>
                <input 
                  type="file" 
                  accept=".pdf,application/pdf" 
                  onChange={handleFileUpload} 
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px dashed #0284c7', background: '#f0f9ff', cursor: 'pointer' }}
                />
                {pdfFileName && (
                  <span style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                    Seçilen PDF: {pdfFileName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>TOPLAM SAYFA SAYISI</label>
                <input 
                  type="number" 
                  value={pageCount} 
                  onChange={(e) => setPageCount(e.target.value)} 
                  placeholder="Örn: 72" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>KAPAK GÖRSELİ (ÖNİZLEME VEYA DOSYADAN SEÇ)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src={coverImage} alt="Kapak Önizleme" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>EDITÖRDEN SUNUŞ YAZISI</label>
                <textarea 
                  rows="3" 
                  value={editorNote} 
                  onChange={(e) => setEditorNote(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
                <button 
                  type="submit" 
                  disabled={isPublishing}
                  style={{ background: '#0b132b', color: 'white', padding: '14px 28px', borderRadius: '6px', fontWeight: '700', fontSize: '1rem', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
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
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '20px' }}>
              SİTEDE YAYINDA OLAN DERGİ SAYILARI
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {eDergiList.map((issue) => (
                <div key={issue.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', padding: '16px', background: '#f8fafc', display: 'flex', gap: '14px' }}>
                  <img src={issue.coverImage} alt={issue.monthYear} style={{ width: '75px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1 }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0284c7' }}>{issue.issueNumber}</span>
                      <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.05rem', color: '#0f172a', margin: '2px 0' }}>{issue.monthYear}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>"{issue.theme}"</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (confirm(`"${issue.issueNumber} (${issue.monthYear})"` + ' sayısını siteden kaldırmak istediğinize emin misiniz?')) {
                          onDeleteEDergi(issue.id);
                        }
                      }}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={12} /> Siteden Kaldır
                    </button>
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

            <form onSubmit={handlePublishArticle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MAKALE / ANALİZ BAŞLIĞI *</label>
                <input 
                  type="text" 
                  value={artTitle} 
                  onChange={(e) => setArtTitle(e.target.value)} 
                  placeholder="Örn: 2026 Güz Dönemi Enerji Koridorları ve Türkiye" 
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
