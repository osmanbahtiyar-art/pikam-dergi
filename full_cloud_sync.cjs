const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://czoecvbxstrsfgwsxvog.supabase.co', 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX');

async function fullCloudSync() {
  console.log('--- STARTING FULL CLOUD DATABASE SEEDING & SYNCHRONIZATION ---');

  // 1. ARTICLES
  const formatParagraphs = (text) => {
    if (!text) return '';
    const clean = text.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?/gi, '').trim();
    const paragraphs = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    return paragraphs
      .map(p => `<p style="margin-bottom: 1.4rem; line-height: 1.8;">${p.replace(/\n/g, '<br />')}</p>`)
      .join('');
  };

  const sampleArticles = [
    {
      id: 'yayinlar-1',
      category: 'EKONOMİ',
      categorycolor: '#10b981',
      title: 'Enflasyon Dinamikleri ve Para Politikası İletişiminin Etkinliği',
      excerpt: 'Makroekonomik istikrar arayışında merkez bankacılığı iletişim kanallarının piyasa beklentileri üzerindeki dönüştürücü etkisi.',
      author: 'Prof. Dr. Ahmet Yılmaz',
      date: '29 Temmuz 2026',
      readtime: '8 Dakika',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
      content: formatParagraphs('Makroekonomik istikrar arayışında merkez bankacılığı iletişim kanallarının piyasa beklentileri üzerindeki dönüştürücü etkisi ampirik verilerle ele alınıyor.\n\nSon dönem gelişmeler, para politikasındaki kararlılığın ve şeffaf iletişimin enflasyon ataletini kırmadaki kritik rolünü bir kez daha gösteriyor.')
    },
    {
      id: 'yayinlar-2',
      category: 'POLİTİKA',
      categorycolor: '#ef4444',
      title: '19 Mayıs 1919: İşgal Altındaki Bir Milletin Yeniden Doğuşu',
      excerpt: 'Bazı tarihler vardır; yalnızca bir günü değil, bir ulusun ta kendisini anlatır. 19 Mayıs 1919 da işte tam olarak böyle bir kırılma noktasıdır.',
      author: 'Sılanur Gör',
      date: '29 Temmuz 2026',
      readtime: '6 Dakika',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
      content: formatParagraphs('Bazı tarihler vardır; yalnızca bir günü değil, bir ulusun ta kendisini anlatır. 19 Mayıs 1919 da işte tam olarak böyle bir kırılma noktasıdır. Osmanlı İmparatorluğu\'nun Mondros Mütarekesi ile fiilen sona erdiği, vatan topraklarının işgalçilerce paylaşıldığı kapkaranlık bir dönemde, Mustafa Kemal Paşa\'nın Bandırma Vapuru ile Samsun\'a ayak basması, bir ulusun kaderini yeniden yazacak olan İstiklal Harbi\'nin meşalesini tutuşturmuştur.\n\nSamsun\'a atılan o ilk adım, sadece askeri bir stratejinin değil, tam bağımsızlık ve millet egemenliğine dayalı modern Türkiye Cumhuriyeti\'nin de ilk fikri temellerini oluşturmuştur.\n\nAmasya Genelgesi, Erzurum ve Sivas Kongreleri ile devam eden bu tarihi yolculuk, "Milletin bağımsızlığını yine milletin azim ve kararı kurtaracaktır" ilkesini perçinlemiş ve Amasya\'dan yükselen o gür ses, meşruiyetini halktan alan TBMM\'nin açılışına kadar uzanmıştır.\n\nBugün Gençlik ve Spor Bayramı olarak kutladığımız 19 Mayıs, Türk gençliğine emanet edilen tarihi bir sorumluluktur. Zira bağımsızlığı kazanmak kadar onu korumak, muasır medeniyetler seviyesinin üzerine çıkarmak ve ilmin, irfanın ışığında ilerletmek de gençliğin en büyük ödevidir.')
    },
    {
      id: 'yayinlar-3',
      category: 'STRATEJİ',
      categorycolor: '#6366f1',
      title: 'Küresel Açlık Azalıyor... Peki Neden Gıda Fiyatları Tırmanıyor?',
      excerpt: 'Dünya genelinde tarımsal üretim rekorları kırılmasına karşın, tüketici enflasyonu ve tedarik zinciri maliyetleri gıda erişimini zorlaştırıyor.',
      author: 'Osman Bahtiyar',
      date: '29 Temmuz 2026',
      readtime: '7 Dakika',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=600&q=80',
      content: formatParagraphs('Dünya genelinde tarımsal üretim rekorları kırılmasına karşın, tüketici enflasyonu ve tedarik zinciri maliyetleri gıda erişimini zorlaştırıyor.\n\nİktisat ve tarım uzmanlarının ortak görüşüne göre, iklim değişikliği etkileri ve jeopolitik gerilimler lojistik maliyetlerini artırırken nihai gıda fiyatlarına yansıyor.\n\nKüresel tarım politikalarında dönüşüm ve sürdürülebilir gıda stratejileri önümüzdeki yılların en stratejik gündem maddesi olmaya devam edecektir.')
    },
    {
      id: 'yayinlar-4',
      category: 'FİNANS',
      categorycolor: '#059669',
      title: 'Altyapı Ekonomisi ve Sivas Belen mevkisindeki Tarım Ağları',
      excerpt: 'Bölgesel kalkınma hamleleri ve ulaştırma koridorlarının lojistik maliyetler üzerindeki çarpan etkisi inceleme konusu.',
      author: 'Semih Kurt',
      date: '29 Temmuz 2026',
      readtime: '5 Dakika',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
      content: formatParagraphs('Bölgesel kalkınma hamleleri ve ulaştırma koridorlarının lojistik maliyetler üzerindeki çarpan etkisi inceleme konusu.\n\nAnadolu\'nun üretim merkezlerini limanlara bağlayan ulaşım projeleri, tarımsal verimliliği artırarak gıda tedarik güvenliğine katkı sağlamaktadır.')
    }
  ];

  console.log('1. Upserting Articles into Supabase Cloud...');
  const { error: artErr } = await client.from('articles').upsert(sampleArticles);
  if (artErr) console.error('Article Upsert Error:', artErr);
  else console.log('✓ Articles synced successfully.');

  // 2. AUTHORS / EKİBİMİZ
  const sampleAuthors = [
    {
      id: 'auth-1',
      name: 'İrem Kumral',
      role: 'Sosyal Medya Direktörü',
      affiliation: 'Grafik Tasarım & Marka Mimarisi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      latestarticle: 'PİKAM Kurumsal Kimlik & Editöryal Tasarım'
    },
    {
      id: 'auth-2',
      name: 'Oğuzhan Kale',
      role: 'PİKAM Finans Editörü',
      affiliation: 'Sermaye Piyasaları & Finansal Okuryazarlık',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      latestarticle: 'Türkiye Finans Tarihi ve Sermaye Piyasaları'
    },
    {
      id: 'auth-3',
      name: 'Nisa Bayır',
      role: 'Sosyal Medya Direktörü',
      affiliation: 'Dijital İletişim & Medya Stratejisi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      latestarticle: 'Dijital Medya Ekosisteminde Yeni Nesil İletişim'
    },
    {
      id: 'auth-4',
      name: 'Emre Gürdağ',
      role: 'PİKAM Kültür & Sanat Editörü',
      affiliation: 'Divan Edebiyatı & Bilim Tarihi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      latestarticle: 'Osmanlı Düşünce Tarihi ve Mitoloji'
    }
  ];

  console.log('2. Upserting Team / Authors into Supabase Cloud...');
  const { error: authErr } = await client.from('authors').upsert(sampleAuthors);
  if (authErr) console.error('Authors Upsert Error:', authErr);
  else console.log('✓ Team / Authors synced successfully.');

  // 3. SITE SETTINGS
  const settingsToPush = [
    {
      id: 'nav_visibility',
      data: {
        ANASAYFA: true,
        'E-DERGİ': true,
        POLİTİKA: false,
        EKONOMİ: false,
        FİNANS: false,
        'KÜLTÜR SANAT': false,
        KÜNYE: true,
        EKİBİMİZ: true
      }
    },
    {
      id: 'section_visibility',
      data: {
        showHero: true,
        showYazarlar: true,
        showEDergi: true,
        showTicker: true
      }
    },
    {
      id: 'kunye_data',
      data: {
        yayinSahibi: 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) A.Ş.',
        imtiyazSahibi: 'Politik ve İktisadi Araştırmalar Merkezi (PİKAM) A.Ş.',
        yayinYonetmeni: 'Prof. Dr. Osman Bahtiyar',
        genelYayinYonetmeni: 'Prof. Dr. Osman Bahtiyar',
        sorumluYaziIsleri: 'Doç. Dr. Selin Aksoy',
        editor: 'Doç. Dr. Selin Aksoy',
        grafikTasarim: 'PİKAM Dijital Yayıncılık Servisi',
        akademikDanismaKurulu: ['Prof. Dr. Ahmet Yılmaz', 'Dr. Murat Karahan', 'Zeynep Demir', 'Prof. Dr. Semih Kurt'],
        iletisim: {
          adres: 'PİKAM Genel Merkezi, Ankara / Türkiye',
          telefon: '+90 (312) 400 00 00',
          eposta: 'info@pikamdergi.com',
          web: 'www.pikamtr.com'
        }
      }
    }
  ];

  console.log('3. Upserting Site Settings into Supabase Cloud...');
  const { error: setErr } = await client.from('site_settings').upsert(settingsToPush);
  if (setErr) console.error('Settings Upsert Error:', setErr);
  else console.log('✓ Site Settings synced successfully.');

  console.log('=== FULL CLOUD SYNCHRONIZATION COMPLETE! ALL DEVICES ARE NOW 100% IN SYNC ===');
}

fullCloudSync();
