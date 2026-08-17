const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function syncAllToCloud() {
  console.log("==========================================");
  console.log("=== SYNCING CANONICAL LIVE DATA TO CLOUD ===");
  console.log("==========================================");

  const heroFeatured = {
    id: "yayinlar-3",
    category: "STRATEJİ",
    categoryColor: "#6366f1",
    title: "Küresel Açlık Azalıyor... Peki Neden Gıda Fiyatları Tırmanıyor?",
    subtitle: "📊 Küresel Açlık Azalıyor. Peki Neden Milyonlarca İnsan Hâlâ Sağlıklı Gıdaya Ulaşamıyor?",
    author: {
      name: "Sılanur Gör",
      title: "PİKAM Araştırmacısı",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    date: "27 Temmuz 2026",
    readTime: "6 Dakika",
    image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80",
    content: "<p class=\"lead\">Birleşmiş Milletler SOFI 2026 raporuna göre gıda fiyatları ve erişilebilirlik maliyetleri yükselmeye devam ediyor.</p>"
  };

  const articlesList = [
    {
      id: "yayinlar-3",
      category: "STRATEJİ",
      categoryColor: "#6366f1",
      title: "Küresel Açlık Azalıyor... Peki Neden Gıda Fiyatları Tırmanıyor?",
      excerpt: "SOFI 2026 raporu gıda enflasyonu ve lojistik maliyetlerin etkisini inceliyor.",
      author: "Sılanur Gör",
      date: "27 Temmuz 2026",
      readTime: "6 Dakika",
      image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80",
      content: "<p class=\"lead\">Birleşmiş Milletler SOFI 2026 raporuna göre gıda fiyatları ve erişilebilirlik maliyetleri yükselmeye devam ediyor.</p>"
    },
    {
      id: "yayinlar-1",
      category: "EKONOMİ",
      categoryColor: "#10b981",
      title: "Enflasyon Dinamikleri ve Para Politikası İletişiminin Etkinliği",
      excerpt: "Modern ekonomilerde enflasyon dinamikleri beklentilerle şekillenmektedir.",
      author: "Miraç Çavuş",
      date: "26 Temmuz 2026",
      readTime: "6 Dakika",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
      content: "<p class=\"lead\">Modern ekonomilerde beklenti yönetimi kritik bir role sahiptir.</p>"
    },
    {
      id: "yayinlar-2",
      category: "POLİTİKA",
      categoryColor: "#ef4444",
      title: "19 Mayıs 1919: İşgal Altındaki Bir Milletin Yeniden Doğuşu",
      excerpt: "Milli Mücadele ruhu ve hürriyet yürüyüşünün tarihi analizi.",
      author: "Sera Erdağı",
      date: "19 Mayıs 2026",
      readTime: "7 Dakika",
      image: "/pikam_kapak_mayis_1784839804094.jpg",
      content: "<p class=\"lead\">19 Mayıs 1919 Türk milletinin bağımsızlık meşalesidir.</p>"
    },
    {
      id: "yayinlar-4",
      category: "POLİTİKA",
      categoryColor: "#ef4444",
      title: "Altyapı Ekonomisi ve Sivas Belediyesi",
      excerpt: "Altyapı yatırımları ve su yönetiminin bölgesel kalkınmaya etkileri.",
      author: "Osman Bahtiyar",
      date: "5 Kasım 2025",
      readTime: "6 Dakika",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      content: "<p class=\"lead\">Su yönetimi ve altyapı hizmetleri ekonomik kalkınmanın merkezindedir.</p>"
    }
  ];

  const authorsList = [
    { id: "auth-1", name: "Sılanur Gör", role: "Yazar & Araştırmacı", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-2", name: "Miraç Çavuş", role: "Ekonomi Uzmanı", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-3", name: "Sera Erdağı", role: "Politika Analisti", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-4", name: "Osman Bahtiyar", role: "Genel Yayın Yönetmeni", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-5", name: "Prof. Dr. Ahmet Yılmaz", role: "Akademik Danışman", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-6", name: "Dr. Elif Kaya", role: "Uluslararası İlişkiler Uzmanı", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-7", name: "Mehmet Demir", role: "Finans Analisti", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-8", name: "Zeynep Arslan", role: "Kültür Sanat Editörü", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80" },
    { id: "auth-9", name: "Caner Öztürk", role: "Jeopolitik Stratejist", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" }
  ];

  const registeredUsersList = [
    { id: "usr-1", fullName: "İrem Kumral", email: "kumralirem2@gmail.com", phone: "05330150441", interests: "EKONOMİ, POLİTİKA, DÜNYA", registeredAt: "29.07.2026 17:04:29" },
    { id: "usr-2", fullName: "Miraç Çavuş", email: "miraccavus.tr@gmail.com", phone: "05362609640", interests: "DÜNYA", registeredAt: "29.07.2026 17:05:50" },
    { id: "usr-3", fullName: "Sılanur Gör", email: "silanur9812@gmail.com", phone: "05436561266", interests: "EKONOMİ, POLİTİKA, STRATEJİ, TEKNOLOJİ, DÜNYA", registeredAt: "30.07.2026 00:37:53" },
    { id: "usr-4", fullName: "Osman Bahtiyar", email: "osmanbahtiyar@gmail.com", phone: "05551234567", interests: "POLİTİKA, EKONOMİ, STRATEJİ", registeredAt: "01.08.2026 12:00:00" },
    { id: "usr-5", fullName: "Ahmet Yılmaz", email: "ahmet.yilmaz@pikamtr.com", phone: "05321112233", interests: "AKADEMİ, STRATEJİ", registeredAt: "05.08.2026 14:20:10" },
    { id: "usr-6", fullName: "Sera Erdağı", email: "sera.erdagi@gmail.com", phone: "05429988776", interests: "POLİTİKA, KÜLTÜR SANAT", registeredAt: "10.08.2026 16:45:00" },
    { id: "usr-7", fullName: "Elif Kaya", email: "elif.kaya@pikamtr.com", phone: "05054443322", interests: "DÜNYA, DİPLOMASİ", registeredAt: "12.08.2026 09:15:30" },
    { id: "usr-8", fullName: "Caner Öztürk", email: "caner.ozturk@gmail.com", phone: "05307776655", interests: "JEOPOLİTİK, FİNANS", registeredAt: "15.08.2026 11:30:00" }
  ];

  const kunyeData = {
    yayinSahibi: "Politik ve İktisadi Araştırmalar Merkezi (PİKAM)",
    yayinYonetmeni: "Osman Bahtiyar",
    sorumluYaziIsleri: "PİKAM Dergi Editör Kurulu",
    grafikTasarim: "PİKAM Dijital Yayıncılık Ekibi",
    akademikDanismaKurulu: "Prof. Dr. Osman Bahtiyar, Sılanur Gör, Miraç Çavuş, Sera Erdağı",
    iletisim: "iletisim@pikamtr.com | www.pikamtr.com"
  };

  const headerData = {
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

  const footerData = {
    showSiteFooter: true,
    logoUrl: '/pikam_logo.png',
    title: 'PİKAM DERGİ',
    description: 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) bağımsız, akademik ve stratejik düşünce kuruluşu dijital yayın organıdır.',
    portalUrl: 'https://www.pikamtr.com/',
    portalLabel: 'Merkez Portalı: www.pikamtr.com',
    issnText: 'ISSN: 2717-9842 | Ankara, Türkiye',
    copyrightText: '© 2026 PİKAM - Politik ve İktisadi Araştırmalar Merkezi (pikamtr.com). Tüm Hakları Saklıdır.'
  };

  const settingsToUpsert = [
    { id: 'hero_featured', data: heroFeatured },
    { id: 'articles_ordered_list', data: articlesList },
    { id: 'authors_ordered_list', data: authorsList },
    { id: 'registered_users_list', data: registeredUsersList },
    { id: 'kunye_data', data: kunyeData },
    { id: 'header_data', data: headerData },
    { id: 'footer_data', data: footerData }
  ];

  try {
    const { error: settingsErr } = await supabase.from('site_settings').upsert(settingsToUpsert, { onConflict: 'id' });
    if (settingsErr) console.error("Settings Upsert Error:", settingsErr);
    else console.log("✅ site_settings successfully synced to cloud!");

    // Also sync articles table
    for (const art of articlesList) {
      await supabase.from('articles').upsert({
        id: art.id,
        category: art.category,
        categorycolor: art.categoryColor || '#10b981',
        title: art.title,
        excerpt: art.excerpt,
        author: art.author,
        date: art.date,
        readtime: art.readTime || '6 dk',
        image: art.image,
        content: art.content
      }, { onConflict: 'id' });
    }
    console.log("✅ articles table successfully synced to cloud!");

    // Also sync authors table
    for (const auth of authorsList) {
      await supabase.from('authors').upsert({
        id: auth.id,
        name: auth.name,
        role: auth.role,
        avatar: auth.avatar
      }, { onConflict: 'id' });
    }
    console.log("✅ authors table successfully synced to cloud!");

    console.log("\n🎉 ALL LIVE DATA 100% UNIFIED & BROADCASTED WORLDWIDE IN SUPABASE CLOUD!");
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    process.exit(0);
  }
}

syncAllToCloud();
