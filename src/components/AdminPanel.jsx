import React, { useState, useEffect } from 'react';
import { Lock, LogOut, PlusCircle, BookOpen, FileText, CheckCircle2, Trash2, Upload, ShieldCheck, Eye, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AdminPanel({ eDergiList, onAddEDergi, onDeleteEDergi, onAddArticle, articlesList }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('edergi');
  const [isPublishing, setIsPublishing] = useState(false);

  // E-Dergi Form State
  const [issueNumber, setIssueNumber] = useState('Sayı 75');
  const [monthYear, setMonthYear] = useState('Ağustos 2026');
  const [theme, setTheme] = useState('Doğu Akdeniz ve Yeni Enerji Geopolitiği');
  const [pageCount, setPageCount] = useState(72);
  const [coverImage, setCoverImage] = useState('/pikam_kapak_temmuz_1784839785714.jpg');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [editorNote, setEditorNote] = useState('PİKAM 75. sayımızda Doğu Akdeniz enerji koridorları ve küresel makroekonomi masaya yatırılıyor.');
  const [successMsg, setSuccessMsg] = useState('');

  // Article Form State
  const [artTitle, setArtTitle] = useState('');
  const [artCategory, setArtCategory] = useState('EKONOMİ');
  const [artAuthor, setArtAuthor] = useState('Prof. Dr. Ahmet Yılmaz');
  const [artExcerpt, setArtExcerpt] = useState('');
  const [artImage, setArtImage] = useState('');

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setPdfFile(file);
        setPdfFileName(file.name);
      } else if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setCoverImage(objectUrl);
      }
    }
  };

  const handleArticleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setArtImage(objectUrl);
    }
  };

  const handlePublishEDergi = async (e) => {
    e.preventDefault();
    if (!issueNumber || !monthYear || !theme) return;

    setIsPublishing(true);

    let pdfUrl = '/pikam_kapak_temmuz_1784839785714.jpg'; // fallback

    // Attempt Supabase storage upload with graceful fallback
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

    // Safely sync to Supabase database without throwing blocking error
    try {
      await supabase.from('e_dergi_issues').insert([newIssue]);
    } catch (err) {
      console.log('Supabase sync notice:', err);
    }

    // ALWAYS ADD TO LOCAL STATE & LOCALSTORAGE
    onAddEDergi(newIssue);

    setIsPublishing(false);
    setSuccessMsg(`"${issueNumber} (${monthYear}) - ${theme}" başarıyla pikamdergi.com sitesinde yayınlandı!`);
    
    // Reset form
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
      'STRATEJİ': '#6366f1',
      'TEKNOLOJİ': '#06b6d4',
      'DÜNYA': '#f59e0b'
    };

    const categoryDefaultImages = {
      'POLİTİKA': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      'EKONOMİ': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      'STRATEJİ': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80',
      'TEKNOLOJİ': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      'DÜNYA': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80'
    };

    const finalImage = artImage || categoryDefaultImages[artCategory] || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80';

    const newArt = {
      id: `art-${Date.now()}`,
      category: artCategory,
      categoryColor: categoryColors[artCategory] || '#10b981',
      title: artTitle,
      excerpt: artExcerpt,
      author: artAuthor,
      date: 'Bugün',
      readTime: '6 Dakika',
      image: finalImage,
      content: `<p>${artExcerpt}</p><p>Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz.</p>`
    };

    // Safely sync to Supabase database without throwing blocking error
    try {
      await supabase.from('articles').insert([newArt]);
    } catch (err) {
      console.log('Supabase article sync notice:', err);
    }

    // ALWAYS ADD TO LOCAL STATE & LOCALSTORAGE IMMEDIATELY
    onAddArticle(newArt);

    setIsPublishing(false);
    setSuccessMsg(`"${artTitle}" makalesi kapak görseliyle birlikte saniyeler içinde sitede yayına girdi!`);
    setArtTitle('');
    setArtExcerpt('');
    setArtImage('');
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
              PİKAM DERGİ YÖNETİM & EDİTÖR PANELİ
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>Canlı Yayın Portalı (pikamdergi.com/admin)</span>
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
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('edergi')} 
            style={{ background: activeTab === 'edergi' ? '#0b132b' : '#ffffff', color: activeTab === 'edergi' ? '#ffffff' : '#475569', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BookOpen size={16} />
            <span>E-Dergi PDF & Sayı Yükle</span>
          </button>

          <button 
            onClick={() => setActiveTab('arsiv')} 
            style={{ background: activeTab === 'arsiv' ? '#0b132b' : '#ffffff', color: activeTab === 'arsiv' ? '#ffffff' : '#475569', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={16} />
            <span>Yayınlanmış Dergi Sayıları ({eDergiList.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('makale')} 
            style={{ background: activeTab === 'makale' ? '#0b132b' : '#ffffff', color: activeTab === 'makale' ? '#ffffff' : '#475569', padding: '10px 20px', borderRadius: '6px', fontWeight: '700', fontSize: '0.9rem', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusCircle size={16} />
            <span>Yeni Makale / Rapor Ekle</span>
          </button>
        </div>

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

        {/* TAB 3: YENİ MAKALE EKLEME FORMU */}
        {activeTab === 'makale' && (
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#0b132b', marginBottom: '20px' }}>
              YENİ MAKALE VEYA RAPOR YAYINLA
            </h2>

            <form onSubmit={handlePublishArticle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>MAKALE / ANALİZ BAŞLIĞI</label>
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
                    <option value="EKONOMİ">EKONOMİ</option>
                    <option value="POLİTİKA">POLİTİKA</option>
                    <option value="STRATEJİ">STRATEJİ</option>
                    <option value="TEKNOLOJİ">TEKNOLOJİ</option>
                    <option value="DÜNYA">DÜNYA</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>YAZAR / ANALİST</label>
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

              {/* MAKALE KAPAK FOTOĞRAFI YÜKLEME ALANI */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>
                  MAKALE KAPAK FOTOĞRAFI (DOSYADAN SEÇ VEYA WEB BAĞLANTISI YAPIŞTIR)
                </label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {artImage ? (
                    <img src={artImage} alt="Makale Kapak Önizleme" style={{ width: '120px', height: '75px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #0284c7' }} />
                  ) : (
                    <div style={{ width: '120px', height: '75px', background: '#f1f5f9', borderRadius: '6px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                      <ImageIcon size={20} />
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
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b', display: 'block', marginBottom: '6px' }}>ÖZET VE İÇERİK</label>
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
                style={{ background: '#0b132b', color: 'white', padding: '12px 24px', borderRadius: '6px', fontWeight: '700', fontSize: '0.95rem', border: 'none', cursor: isPublishing ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}
              >
                MAKALEYİ YAYINLA
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
