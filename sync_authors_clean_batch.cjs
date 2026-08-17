const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function cleanSync() {
  console.log("Upserting ultra-lightweight clean authors_ordered_list to Supabase Cloud...");

  const clean17Authors = [
    { id: "auth-4", name: "Osman Bahtiyar", role: "Genel Yayın Yönetmeni", affiliation: "PİKAM Kurucusu & Yönetim Kurulu Başkanı", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", latestArticle: "Kamu yönetimi, yerel yönetimlerde altyapı ekonomisi..." },
    { id: "auth-1", name: "Sılanur Gör", role: "Genel Yayın Yönetmeni Yardımcısı", affiliation: "PİKAM Yönetim Kurulu", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", latestArticle: "Uluslararası ticaret ve küresel gıda güvenliği..." },
    { id: "auth-2", name: "Miraç Çavuş", role: "Ekonomi ve Finans Politikaları Uzmanı", affiliation: "PİKAM Ekonomi Masası", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", latestArticle: "Makroekonomi ve para politikaları..." },
    { id: "auth-3", name: "Sera Erdağı", role: "Politika Analisti", affiliation: "PİKAM Kamu Stratejileri Masası", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", latestArticle: "Türk siyasi tarihi ve kurumlaşma politikaları..." },
    { id: "auth-1785333313380", name: "İrem Kumral", role: "Ekonomi & Finans Araştırmacısı", affiliation: "PİKAM Ekonomi Masası", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", latestArticle: "Makroekonomi ve gelir dağılımı..." },
    { id: "auth-10", name: "Ayça Sude Kaya", role: "Araştırmacı Yazar", affiliation: "PİKAM Strateji Masası", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", latestArticle: "Dijital ekonomi politikaları..." },
    { id: "auth-12", name: "Nisa Bayır", role: "Politika Uzmanı", affiliation: "PİKAM Kamu Yönetimi Masası", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80", latestArticle: "Kamu diplomasisi ve yönetişim..." },
    { id: "auth-1786866647845", name: "Zeynep Sare Ağca", role: "Kültür & Medya Uzmanı", affiliation: "PİKAM Yayın Kurulu", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80", latestArticle: "Medya sosyolojisi ve yayıncılık..." },
    { id: "auth-test-1", name: "Doğancan Tekin", role: "Jeopolitik Analisti", affiliation: "PİKAM Güvenlik Masası", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", latestArticle: "Savunma sanayii ve Avrasya jeopolitiği..." },
    { id: "auth-5", name: "Prof. Dr. Ahmet Yılmaz", role: "Akademik Danışma Kurulu Başkanı", affiliation: "PİKAM Danışma Kurulu", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", latestArticle: "Uluslararası iktisat ve kamu ekonomisi..." },
    { id: "auth-6", name: "Dr. Elif Kaya", role: "Uluslararası İlişkiler Uzmanı", affiliation: "PİKAM Dış Politika Masası", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80", latestArticle: "AB ilişkileri ve NATO güvenlik mimarisi..." },
    { id: "auth-7", name: "Mehmet Demir", role: "Finansal Piyasalar Analisti", affiliation: "PİKAM Finans Masası", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80", latestArticle: "CBDC ve küresel finans..." },
    { id: "auth-8", name: "Zeynep Arslan", role: "Kültür Sanat Editörü", affiliation: "PİKAM Yayın Kurulu", avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=200&q=80", latestArticle: "Kültür politikaları..." },
    { id: "auth-9", name: "Caner Öztürk", role: "Jeopolitik Stratejist", affiliation: "PİKAM Güvenlik Masası", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", latestArticle: "Tedarik zinciri ve enerji hatları..." },
    { id: "auth-11", name: "Oğuzhan Kale", role: "Ekonomist", affiliation: "PİKAM Makroekonomi Ekibi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", latestArticle: "Kamu maliyesi..." },
    { id: "auth-13", name: "Emre Gürdağ", role: "Kıdemli Stratejist", affiliation: "PİKAM Strateji Kurulu", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", latestArticle: "Enerji güvenliği..." },
    { id: "auth-14", name: "Eda Akpınar", role: "Kültür & Medya Editörü", affiliation: "PİKAM Yayın Masası", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80", latestArticle: "Kültürel diplomasi..." }
  ];

  const { error } = await supabase.from('site_settings').upsert({
    id: 'authors_ordered_list',
    data: clean17Authors
  }, { onConflict: 'id' });

  if (error) console.error("Error:", error);
  else console.log("✅ SUCCESS: authors_ordered_list 17 authors saved cleanly!");

  process.exit(0);
}

cleanSync().catch(e => { console.error(e); process.exit(1); });
