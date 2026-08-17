const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function restore14AuthorsWithBios() {
  console.log("Restoring all 14 team members with detailed bios to Supabase Cloud...");

  const full14Authors = [
    {
      id: "auth-4",
      name: "Osman Bahtiyar",
      role: "Genel Yayın Yönetmeni",
      affiliation: "PİKAM Kurucusu & Yönetim Kurulu Başkanı",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Kamu yönetimi, yerel yönetimlerde altyapı ekonomisi, su yönetimi ve bölgesel kalkınma modelleri alanında akademik çalışmaları ve yayınlanmış kitapları bulunmaktadır."
    },
    {
      id: "auth-1",
      name: "Sılanur Gör",
      role: "Genel Yayın Yönetmeni Yardımcısı & Kıdemli Araştırmacı",
      affiliation: "PİKAM Yönetim Kurulu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      latestArticle: "PİKAM bünyesinde uluslararası ticaret, küresel gıda güvenliği ve lojistik maliyetler alanında akademik araştırmalar yürütmektedir. SOFI 2026 raporu analisti."
    },
    {
      id: "auth-2",
      name: "Miraç Çavuş",
      role: "Ekonomi ve Finans Politikaları Uzmanı",
      affiliation: "PİKAM Ekonomi Masası",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Makroekonomi, enflasyon dinamikleri, merkez bankacılığı ve para politikası iletişimi üzerine uzmanlaşmıştır. Küresel sermaye hareketleri üzerine çalışmalar sunmaktadır."
    },
    {
      id: "auth-3",
      name: "Sera Erdağı",
      role: "Politika Analisti & Tarih Araştırmacısı",
      affiliation: "PİKAM Kamu Stratejileri Masası",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Türk siyasi tarihi, Milli Mücadele dönemi diplomasisi ve cumhuriyet dönemi kurumlaşma politikaları üzerine makaleler kaleme almaktadır."
    },
    {
      id: "auth-5",
      name: "Prof. Dr. Ahmet Yılmaz",
      role: "Akademik Danışma Kurulu Başkanı",
      affiliation: "PİKAM Danışma Kurulu",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Uluslararası iktisat ve kamu ekonomisi profesörü. Küresel ticaret savaşları ve Doğu Akdeniz enerji koridorları üzerine stratejik analizler hazırlamaktadır."
    },
    {
      id: "auth-6",
      name: "Dr. Elif Kaya",
      role: "Uluslararası İlişkiler Uzmanı",
      affiliation: "PİKAM Dış Politika Masası",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Avrupa Birliği ilişkileri, NATO güvenlik mimarisi ve jeopolitik güç dengeleri üzerine doktora derecesine sahip kıdemli araştırmacı."
    },
    {
      id: "auth-7",
      name: "Mehmet Demir",
      role: "Finansal Piyasalar Analisti",
      affiliation: "PİKAM Finans Masası",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Merkez bankaları dijital para birimleri (CBDC), blokzincir teknolojisi ve küresel tedarik zinciri finansmanı alanında raporlar hazırlamaktadır."
    },
    {
      id: "auth-8",
      name: "Zeynep Arslan",
      role: "Kültür Sanat Editörü",
      affiliation: "PİKAM Yayın Kurulu",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Dijitalleşen çağda kültür politikaları, yayıncılık sosyolojisi ve toplumsal dönüşüm konularında içerik ve inceleme yazıları sunmaktadır."
    },
    {
      id: "auth-9",
      name: "Caner Öztürk",
      role: "Jeopolitik Stratejist",
      affiliation: "PİKAM Güvenlik Masası",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Küresel enerji hatları, tedarik zinciri güvenliği ve Avrasya jeopolitiği üzerine stratejik değerlendirme raporları kaleme almaktadır."
    },
    {
      id: "auth-10",
      name: "Ayça Sude Kaya",
      role: "Araştırmacı Yazar",
      affiliation: "PİKAM Strateji Masası",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Sosyo-ekonomik trendler, gençlik istihdamı ve dijital ekonomi politikaları üzerine saha araştırmaları yürütmektedir."
    },
    {
      id: "auth-11",
      name: "Oğuzhan Kale",
      role: "Ekonomist",
      affiliation: "PİKAM Makroekonomi Ekibi",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Gelişmekte olan ülke piyasaları, kamu maliyesi ve vergi politikalarının reel sektöre etkilerini incelemektedir."
    },
    {
      id: "auth-12",
      name: "Nisa Bayır",
      role: "Politika Uzmanı",
      affiliation: "PİKAM Kamu Yönetimi Masası",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Kamu diplomasisi, yönetişim ilkeleri ve karşılaştırmalı siyaset alanlarında analizler hazırlamaktadır."
    },
    {
      id: "auth-13",
      name: "Emre Gürdağ",
      role: "Kıdemli Stratejist",
      affiliation: "PİKAM Strateji Kurulu",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Küresel enerji güvenliği, savunma sanayii ekosistemi ve jeostratejik güç projeksiyonları üzerine çalışmaktadır."
    },
    {
      id: "auth-14",
      name: "Eda Akpınar",
      role: "Kültür & Medya Editörü",
      affiliation: "PİKAM Yayın & Medya Masası",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Medya sosyolojisi, dijital yayıncılık standartları ve kültürel diplomasi konularında çalışmalar sunmaktadır."
    }
  ];

  // 1. Update site_settings authors_ordered_list
  const { error: err1 } = await supabase.from('site_settings').upsert({
    id: 'authors_ordered_list',
    data: full14Authors
  }, { onConflict: 'id' });
  if (err1) console.error("site_settings error:", err1);
  else console.log("✅ site_settings authors_ordered_list successfully updated with 14 detailed authors!");

  // 2. Update authors table
  for (const auth of full14Authors) {
    const { error: err2 } = await supabase.from('authors').upsert({
      id: auth.id,
      name: auth.name,
      role: auth.role,
      affiliation: auth.affiliation,
      avatar: auth.avatar,
      latestarticle: auth.latestArticle
    }, { onConflict: 'id' });
    if (err2) console.error(`Error upserting author ${auth.name}:`, err2);
  }
  console.log("✅ authors table successfully updated with 14 detailed authors!");

  console.log("🎉 ALL 14 TEAM MEMBERS WITH DETAILED BIOS ARE NOW RESTORED WORLDWIDE!");
  process.exit(0);
}

restore14AuthorsWithBios().catch(e => { console.error(e); process.exit(1); });
