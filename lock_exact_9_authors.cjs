const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function lockExact9Authors() {
  console.log("Locking EXACT 9 authors based on user screenshots + Ayça Sude Kaya...");

  const exact9Authors = [
    {
      id: "auth-1786866647845",
      name: "Zeynep Sare Ağca",
      role: "GENEL YAYIN YÖNETMENİ",
      affiliation: "PİKAM Genel Yayın Yönetimi",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Halkla İlişkiler bölümü lisans öğrencisidir. Medya ve iletişim alanlarına ilgi duymakta olup televizyon kanalı ve dijital platformlarda yayınlar yapmıştır. Bununla beraber lise yıllarından itibaren dergicilik faaliyetlerinde aktif rol oynamaktadır. Başlıca ilgi alanları arasında iletişim bilimi, siyasal iletişim, uluslararası ilişkiler ve siyaset bilimi yer almaktadır."
    },
    {
      id: "auth-1785333313380",
      name: "İrem Kumral",
      role: "SOSYAL MEDYA DİREKTÖRÜ",
      affiliation: "PİKAM Brand Designer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      latestArticle: "İrem Kumral, lise eğitimini Güzel Sanatlar Lisesi Resim Bölümü'nde, lisans eğitimini ise Grafik Tasarım alanında tamamlamıştır. Yaklaşık altı yıldır profesyonel olarak grafik tasarım ve marka tasarımı alanında çalışmalarını sürdürmektedir. Kariyeri boyunca kurumsal kimlik tasarımı, marka stratejisi, ambalaj tasarımı, dijital iletişim ve editöryal tasarım gibi farklı disiplinlerde üretim yapmıştır. Kurucusu olduğu YALIM Candle markasında marka kimliği, ürün geliştirme, ambalaj tasarımı ve dijital iletişim süreçlerini yöneterek tasarımın stratejik yönü üzerine deneyim kazanmıştır. PİKAM Dergi'de Brand Designer olarak görev almaktadır. İlgi alanları arasında marka stratejisi, görsel kimlik sistemleri, tipografi, ambalaj tasarımı, editöryal tasarım ve yapay zekâ destekli yaratıcı üretim süreçleri yer almaktadır."
    },
    {
      id: "auth-12",
      name: "Nisa Bayır",
      role: "SOSYAL MEDYA DİREKTÖRÜ",
      affiliation: "PİKAM Sosyal Medya Ekibi",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Pamukkale Üniversitesi Çalışma Ekonomisi ve Endüstri İlişkileri Bölümünde lisans eğitimini sürdürmektedir. PİKAM bünyesinde sosyal medya süreçleriyle ilgilenmekte olup içerik çalışmalarında yer almaktadır."
    },
    {
      id: "auth-1785449849542",
      name: "Eda Akpınar",
      role: "PİKAM ULUSLARARASI İLİŞKİLER EDİTÖRÜ",
      affiliation: "PİKAM Dış Politika Masası",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Marmara Üniversitesi Siyaset Bilimi ve Uluslararası İlişkiler öğrencisidir. Temel çalışma ve ilgi alanları arasında Türk dış politikası, Türkiye siyasi tarihi, ekonomi politikaları, ekonomik entegrasyon ve uluslararası ilişkiler yer almaktadır."
    },
    {
      id: "auth-1785450479146",
      name: "Sılanur Gör",
      role: "PİKAM EKONOMİ EDİTÖRÜ",
      affiliation: "PİKAM Ekonomi Masası",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Süleyman Demirel Üniversitesi İktisat Bölümü öğrencisidir. Ekonomi politikaları, enflasyon, finans ve veri analizi alanlarıyla ilgilenmektedir."
    },
    {
      id: "auth-2",
      name: "Oğuzhan Kale",
      role: "PİKAM FİNANS EDİTÖRÜ",
      affiliation: "PİKAM Finans Masası",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Sakarya Üniversitesi İktisat Bölümü mezunudur. PİKAM bünyesinde Finans Editörü olarak görev yapmaktadır. Temel çalışma ve ilgi alanları arasında Türkiye'nin finans tarihi, sermaye piyasalarının evrimi ve finansal okuryazarlık yer almaktadır."
    },
    {
      id: "auth-test-1",
      name: "Doğancan Tekin",
      role: "PİKAM POLİTİKA EDİTÖRÜ",
      affiliation: "PİKAM Politika Masası",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Bilkent Üniversitesi Uluslararası İlişkiler mezunudur. Başlıca ilgi alanları dış politika, enerji politikaları, sürdürülebilirlik, tarih ve şehirleşmedir. Bu alanlarda araştırmalar yapmakta ve yazılar kaleme almaktadır."
    },
    {
      id: "auth-4",
      name: "Emre Gürdağ",
      role: "PİKAM KÜLTÜR & SANAT EDİTÖRÜ",
      affiliation: "PİKAM Kültür Sanat Masası",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Lisans eğitimini Boğaziçi Üniversitesi Moleküler Biyoloji ve Genetik bölümünde tamamlamıştır. Aynı üniversitede Türk Dili ve Edebiyatı bölümünde Eski Türk Edebiyatı alanında yüksek lisans eğitimine devam etmektedir. PİKAM Dergi Kültür-Sanat editörlüğünü üstlenmektedir. Akademik çalışma ve ilgi alanlarının başında Divan Edebiyatı, Osmanlı nesri, yazma kültürü, Osmanlı'da okült ve büyü, mitler ve mitolojiler, bilim tarihi, sözlü kültür gelmektedir."
    },
    {
      id: "auth-10",
      name: "Ayça Sude Kaya",
      role: "PİKAM STRATEJİ EDİTÖRÜ",
      affiliation: "PİKAM Strateji Masası",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Sosyo-ekonomik trendler, gençlik istihdamı ve dijital ekonomi politikaları üzerine saha araştırmaları yürütmektedir."
    }
  ];

  // 1. Update site_settings
  const { error: err1 } = await supabase.from('site_settings').upsert({
    id: 'authors_ordered_list',
    data: exact9Authors
  }, { onConflict: 'id' });

  if (err1) console.error("site_settings error:", err1);
  else console.log("✅ site_settings authors_ordered_list locked to EXACT 9 authors!");

  // 2. Delete ALL other authors from Supabase authors table that are NOT in these 9 IDs
  const keepIds = exact9Authors.map(a => a.id);
  const { data: currentAuthors } = await supabase.from('authors').select('id');
  if (currentAuthors) {
    const toDelete = currentAuthors.filter(ca => !keepIds.includes(ca.id));
    for (const td of toDelete) {
      await supabase.from('authors').delete().eq('id', td.id);
      console.log(`Deleted extra author ID ${td.id} from authors table`);
    }
  }

  // 3. Upsert exact 9 authors to authors table
  for (const auth of exact9Authors) {
    await supabase.from('authors').upsert({
      id: auth.id,
      name: auth.name,
      role: auth.role,
      affiliation: auth.affiliation,
      avatar: auth.avatar,
      latestarticle: auth.latestArticle
    }, { onConflict: 'id' });
  }

  console.log("🎉 SUCCESS: EXACT 9 AUTHORS LOCKED! ALL OTHERS DELETED FROM CLOUD!");
  process.exit(0);
}

lockExact9Authors().catch(e => { console.error(e); process.exit(1); });
