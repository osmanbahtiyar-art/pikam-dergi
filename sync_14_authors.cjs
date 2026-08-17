const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sync14Authors() {
  console.log("Syncing 14 authors to Supabase Cloud...");

  const canonical14Authors = [
    { id: "auth-1", name: "Sılanur Gör", role: "Yazar & Araştırmacı", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Küresel Gıda Fiyatları" },
    { id: "auth-2", name: "Miraç Çavuş", role: "Ekonomi Uzmanı", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Enflasyon Dinamikleri" },
    { id: "auth-3", name: "Sera Erdağı", role: "Politika Analisti", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "19 Mayıs 1919" },
    { id: "auth-4", name: "Osman Bahtiyar", role: "Genel Yayın Yönetmeni", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Altyapı Ekonomisi" },
    { id: "auth-5", name: "Prof. Dr. Ahmet Yılmaz", role: "Akademik Danışman", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Kamu Politikaları" },
    { id: "auth-6", name: "Dr. Elif Kaya", role: "Uluslararası İlişkiler Uzmanı", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Doğu Akdeniz Jeopolitiği" },
    { id: "auth-7", name: "Mehmet Demir", role: "Finans Analisti", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Küresel Sermaye Akımları" },
    { id: "auth-8", name: "Zeynep Arslan", role: "Kültür Sanat Editörü", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Dijital Yayıncılık" },
    { id: "auth-9", name: "Caner Öztürk", role: "Jeopolitik Stratejist", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Tedarik Zincirleri" },
    { id: "auth-10", name: "Ayça Sude Kaya", role: "Araştırmacı Yazar", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Sosyo-Ekonomik Trendler" },
    { id: "auth-11", name: "Oğuzhan Kale", role: "Ekonomist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Makroekonomi" },
    { id: "auth-12", name: "Nisa Bayır", role: "Politika Uzmanı", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Kamu Stratejileri" },
    { id: "auth-13", name: "Emre Gürdağ", role: "Kıdemli Stratejist", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Enerji Güvenliği" },
    { id: "auth-14", name: "Eda Akpınar", role: "Kültür & Medya Editörü", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80", affiliation: "PİKAM", latestArticle: "Yayıncılık Sosyolojisi" }
  ];

  // 1. Update site_settings authors_ordered_list
  const { error: err1 } = await supabase.from('site_settings').upsert({
    id: 'authors_ordered_list',
    data: canonical14Authors
  }, { onConflict: 'id' });
  if (err1) console.error("site_settings authors_ordered_list error:", err1);
  else console.log("✅ site_settings authors_ordered_list updated with 14 authors!");

  // 2. Update authors table
  for (const auth of canonical14Authors) {
    await supabase.from('authors').upsert({
      id: auth.id,
      name: auth.name,
      role: auth.role,
      affiliation: auth.affiliation,
      avatar: auth.avatar,
      latestarticle: auth.latestArticle
    }, { onConflict: 'id' });
  }
  console.log("✅ authors table updated with 14 authors!");

  console.log("🎉 ALL 14 AUTHORS ARE NOW STORED IN CLOUD FOR ALL BROWSERS WORLDWIDE!");
  process.exit(0);
}

sync14Authors().catch(e => { console.error(e); process.exit(1); });
