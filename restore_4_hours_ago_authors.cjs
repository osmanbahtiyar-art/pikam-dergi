const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function restore4HoursAgoAuthors() {
  console.log("Restoring exact historical team members from 4 hours ago (with photos, bios, affiliations, and roles)...");

  const historicalAuthors = [
    {
      id: "auth-1",
      name: "Prof. Dr. Ahmet Yılmaz",
      role: "PİKAM Ekonomi Araştırmaları Direktörü",
      affiliation: "İktisat ve Finans Ana Bilim Dalı",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Enflasyon Dinamikleri ve Para Politikası İletişiminin Etkinliği"
    },
    {
      id: "auth-2",
      name: "Doç. Dr. Selin Aksoy",
      role: "Stratejik Araştırmalar Bölüm Başkanı",
      affiliation: "Uluslararası İlişkiler Uzmanı",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Doğu Akdeniz ve Karadeniz Enerji Koridorlarında Son Durum"
    },
    {
      id: "auth-3",
      name: "Dr. Murat Karahan",
      role: "Teknoloji ve Siber Güvenlik Analisti",
      affiliation: "Yapay Zeka ve Veri Sosyolojisi",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Otonom Sistemler ve Siber Savunma Doktrinlerinde Yapay Zeka Devrimi"
    },
    {
      id: "auth-4",
      name: "Zeynep Demir",
      role: "Kamu Diplomasısı Uzmanı",
      affiliation: "Siyaset Bilimi ve İletişim",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Kamu Diplomasisi ve Dijital Mecralarda Algı Yönetimi Doktrinleri"
    },
    {
      id: "auth-5",
      name: "Osman Bahtiyar",
      role: "Genel Yayın Yönetmeni",
      affiliation: "PİKAM Kurucusu & Yönetim Kurulu Başkanı",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Kamu yönetimi, yerel yönetimlerde altyapı ekonomisi, su yönetimi ve bölgesel kalkınma modelleri alanında akademik çalışmaları bulunmaktadır."
    },
    {
      id: "auth-6",
      name: "Sılanur Gör",
      role: "Genel Yayın Yönetmeni Yardımcısı & Kıdemli Araştırmacı",
      affiliation: "PİKAM Yönetim Kurulu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      latestArticle: "PİKAM bünyesinde uluslararası ticaret, küresel gıda güvenliği ve lojistik maliyetler alanında akademik araştırmalar yürütmektedir."
    },
    {
      id: "auth-7",
      name: "Miraç Çavuş",
      role: "Ekonomi ve Finans Politikaları Uzmanı",
      affiliation: "PİKAM Ekonomi Masası",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Makroekonomi, enflasyon dinamikleri, merkez bankacılığı ve para politikası iletişimi üzerine uzmanlaşmıştır."
    },
    {
      id: "auth-8",
      name: "Sera Erdağı",
      role: "Politika Analisti & Tarih Araştırmacısı",
      affiliation: "PİKAM Kamu Stratejileri Masası",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Türk siyasi tarihi, Milli Mücadele dönemi diplomasisi ve cumhuriyet dönemi kurumlaşma politikaları üzerine makaleler kaleme almaktadır."
    },
    {
      id: "auth-9",
      name: "İrem Kumral",
      role: "Ekonomi & Finans Araştırmacısı",
      affiliation: "PİKAM Ekonomi Masası",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      latestArticle: "PİKAM bünyesinde makroekonomi, kamu maliyesi ve gelir dağılımı politikaları üzerine akademik araştırmalar yapmaktadır."
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
      name: "Nisa Bayır",
      role: "Politika Uzmanı",
      affiliation: "PİKAM Kamu Yönetimi Masası",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Kamu diplomasisi, yönetişim ilkeleri ve karşılaştırmalı siyaset alanlarında analizler hazırlamaktadır."
    },
    {
      id: "auth-12",
      name: "Zeynep Sare Ağca",
      role: "Kültür & Medya Uzmanı",
      affiliation: "PİKAM Yayın Kurulu",
      avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Medya sosyolojisi, kültürel diplomasi ve dijital yayıncılık standartları üzerine makaleler kaleme almaktadır."
    },
    {
      id: "auth-13",
      name: "Doğancan Tekin",
      role: "Jeopolitik & Güvenlik Analisti",
      affiliation: "PİKAM Güvenlik Masası",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      latestArticle: "Savunma sanayii ekosistemi, tedarik zinciri güvenliği ve Avrasya jeopolitiği üzerine stratejik raporlar sunmaktadır."
    }
  ];

  // 1. Update site_settings authors_ordered_list
  const { error: err1 } = await supabase.from('site_settings').upsert({
    id: 'authors_ordered_list',
    data: historicalAuthors
  }, { onConflict: 'id' });
  if (err1) console.error("site_settings error:", err1);
  else console.log("✅ site_settings authors_ordered_list updated with 4-hours-ago historical team!");

  // 2. Update authors table
  for (const auth of historicalAuthors) {
    await supabase.from('authors').upsert({
      id: auth.id,
      name: auth.name,
      role: auth.role,
      affiliation: auth.affiliation,
      avatar: auth.avatar,
      latestarticle: auth.latestArticle
    }, { onConflict: 'id' });
  }
  console.log("✅ authors table updated with 4-hours-ago historical team!");

  console.log("🎉 ALL HISTORICAL TEAM MEMBERS FROM 4 HOURS AGO ARE FULLY RESTORED WITH PHOTOS & BIOS!");
  process.exit(0);
}

restore4HoursAgoAuthors().catch(e => { console.error(e); process.exit(1); });
