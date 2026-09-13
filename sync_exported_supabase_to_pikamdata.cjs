const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'src', 'data', 'supabase_export_backup.json');
const rawBackup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const settings = rawBackup.settings || [];
const getSetting = (id) => settings.find(s => s.id === id)?.data;

const authorsList = getSetting('authors_ordered_list') || rawBackup.authors || [];
const heroFeatured = getSetting('hero_featured') || {
  id: "hero-1",
  title: "Doğu Akdeniz Enerji Mimarisi ve Yeni Güç Dengeleri: PİKAM 2026 Stratejik Raporu",
  subtitle: "Doğrudan yabancı yatırımların yön değiştirdiği ve küresel navlun maliyetlerinin yeniden şekillendiği 2026 konjonktüründe Türkiye'nin jeopolitik konumu.",
  category: "POLİTİKA",
  categoryColor: "#ef4444",
  author: "Doç. Dr. Selin Aksoy",
  date: "24 Ağustos 2026",
  readTime: "8 dk okuma",
  image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  content: "Doğu Akdeniz ve Karadeniz enerji koridorlarındaki son jeopolitik gelişmeler, küresel ticaret hatları ve Türkiye'nin enerji hub'ı olma stratejisi üzerine PİKAM tarafından hazırlanan kapsamlı inceleme raporu."
};

const defaultArticles = [
  {
    id: "art-1",
    title: "PİKAM 2026 Raporu Yayımlandı: Doğu Akdeniz Enerji Mimarisi ve Yeni Güç Dengeleri",
    excerpt: "Doğrudan yabancı yatırımların yön değiştirdiği ve küresel navlun maliyetlerinin yeniden şekillendiği 2026 konjonktüründe Türkiye'nin jeopolitik konumu.",
    category: "POLİTİKA",
    categoryColor: "#ef4444",
    author: "Doğancan Tekin",
    date: "24 Ağustos 2026",
    readTime: "8 dk",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
    content: "Doğu Akdeniz ve Karadeniz enerji koridorlarındaki son jeopolitik gelişmeler, küresel ticaret hatları ve Türkiye'nin enerji hub'ı olma stratejisi üzerine PİKAM tarafından hazırlanan kapsamlı inceleme raporu."
  },
  {
    id: "art-2",
    title: "Merkez Bankaları Dijital Para Birimleri (CBDC) ve Küresel Finansal Sistem",
    excerpt: "Dolarizasyon baskısı, blokzincir tabanlı ödeme sistemleri ve merkez bankalarının dijital Türk Lirası hamlesinin makroekonomik etkileri.",
    category: "FİNANS",
    categoryColor: "#3b82f6",
    author: "Oğuzhan Kale",
    date: "22 Ağustos 2026",
    readTime: "6 dk",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    content: "Merkez bankaları dijital para birimleri (CBDC), rezerv para birimlerinin geleceği ve küresel finansal sistemin dijitalleşme sürecinin Türkiye ekonomisine muhtemel etkileri."
  },
  {
    id: "art-3",
    title: "Küresel Tedarik Zincirlerinde Yeniden Yapılanma ve Türkiye",
    excerpt: "Nearshoring ve friendshoring eğilimlerinin yükseldiği dönemde Türkiye sanayisinin Avrupa ve Orta Doğu pazarındaki rekabet gücü.",
    category: "EKONOMİ",
    categoryColor: "#10b981",
    author: "Sılanur Gör",
    date: "20 Ağustos 2026",
    readTime: "7 dk",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    content: "Küresel tedarik zincirlerinin bölgeselleşmesi, Türkiye'nin coğrafi avantajları, üretim kapasitesi ve ihracat potansiyelinin analizi."
  },
  {
    id: "art-4",
    title: "Sanat ve Sosyoloji: Dijitalleşen Çağda Yayıncılık ve Kültür Politikaları",
    excerpt: "Yapay zeka araçlarının medya üretimine entegrasyonu, dijital dergicilik ve toplumsal hafızanın korunması üzerine eleştirel bir yaklaşım.",
    category: "KÜLTÜR SANAT",
    categoryColor: "#8b5cf6",
    author: "Emre Gürdağ",
    date: "18 Ağustos 2026",
    readTime: "5 dk",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
    content: "Dijital kültür üretimi, sosyal medya algoritmalarının okuma alışkanlıklarına etkisi ve bağımsız yayıncılığın geleceği."
  }
];

const articlesList = getSetting('articles_ordered_list') && getSetting('articles_ordered_list').length > 0
  ? getSetting('articles_ordered_list')
  : defaultArticles;

const eDergiIssues = rawBackup.issues && rawBackup.issues.length > 0
  ? rawBackup.issues.map(i => ({
      id: i.id,
      issueNumber: i.issuenumber || i.issueNumber || "Sayı 1",
      monthYear: i.monthyear || i.monthYear || "Temmuz 2026",
      theme: i.theme || "PİKAM Dergi Dijital Yayın",
      coverImage: i.coverimage || i.coverImage || "/pikam_logo.png",
      pdfUrl: i.pdfurl || i.pdfUrl || "",
      pageCount: i.pagecount || i.pageCount || 48
    }))
  : [
      {
        id: "edergi-1",
        issueNumber: "Sayı 1",
        monthYear: "Temmuz 2026",
        theme: "Doğu Akdeniz Jeopolitiği ve Küresel Ticaret",
        coverImage: "/pikam_logo.png",
        pdfUrl: "",
        pageCount: 52
      }
    ];

const pikamDataContent = `// Standalone Self-Contained Local Frontend Data for PİKAM DERGİ
export const PIKAM_DATA = {
  heroFeatured: ${JSON.stringify(heroFeatured, null, 2)},
  articles: ${JSON.stringify(articlesList, null, 2)},
  authors: ${JSON.stringify(authorsList, null, 2)},
  eDergiIssues: ${JSON.stringify(eDergiIssues, null, 2)},
  kunye: ${JSON.stringify(getSetting('kunye_data') || {
    yayinSahibi: "Politik ve İktisadi Araştırmalar Merkezi (PİKAM)",
    yayinYonetmeni: "Osman Bahtiyar",
    sorumluYaziIsleri: "PİKAM Dergi Editör Kurulu",
    grafikTasarim: "PİKAM Dijital Yayıncılık Ekibi",
    akademikDanismaKurulu: "Prof. Dr. Osman Bahtiyar, Sılanur Gör, Miraç Çavuş, Sera Erdağı",
    iletisim: "iletisim@pikamtr.com | www.pikamtr.com"
  }, null, 2)}
};
`;

const pikamDataPath = path.join(__dirname, 'src', 'data', 'pikamData.js');
fs.writeFileSync(pikamDataPath, pikamDataContent, 'utf8');
console.log(`✅ Clean standalone pikamData.js written to: ${pikamDataPath}`);
process.exit(0);
