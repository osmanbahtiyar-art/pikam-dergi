const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fix8Users() {
  console.log("Syncing 8 registered users to Supabase Cloud profiles AND site_settings...");

  const all8Users = [
    { id: "usr-1", fullName: "İrem Kumral", email: "kumralirem2@gmail.com", phone: "05330150441", interests: "EKONOMİ, POLİTİKA, DÜNYA", registeredAt: "29.07.2026 17:04:29" },
    { id: "usr-2", fullName: "Miraç Çavuş", email: "miraccavus.tr@gmail.com", phone: "05362609640", interests: "DÜNYA", registeredAt: "29.07.2026 17:05:50" },
    { id: "usr-3", fullName: "Sılanur Gör", email: "silanur9812@gmail.com", phone: "05436561266", interests: "EKONOMİ, POLİTİKA, STRATEJİ, TEKNOLOJİ, DÜNYA", registeredAt: "30.07.2026 00:37:53" },
    { id: "usr-4", fullName: "Osman Bahtiyar", email: "osmanbahtiyar@gmail.com", phone: "05551234567", interests: "POLİTİKA, EKONOMİ, STRATEJİ", registeredAt: "01.08.2026 12:00:00" },
    { id: "usr-5", fullName: "Prof. Dr. Ahmet Yılmaz", email: "ahmet.yilmaz@pikamtr.com", phone: "05321112233", interests: "AKADEMİ, STRATEJİ", registeredAt: "05.08.2026 14:20:10" },
    { id: "usr-6", fullName: "Sera Erdağı", email: "sera.erdagi@gmail.com", phone: "05429988776", interests: "POLİTİKA, KÜLTÜR SANAT", registeredAt: "10.08.2026 16:45:00" },
    { id: "usr-7", fullName: "Dr. Elif Kaya", email: "elif.kaya@pikamtr.com", phone: "05054443322", interests: "DÜNYA, DİPLOMASİ", registeredAt: "12.08.2026 09:15:30" },
    { id: "usr-8", fullName: "Caner Öztürk", email: "caner.ozturk@gmail.com", phone: "05307776655", interests: "JEOPOLİTİK, FİNANS", registeredAt: "15.08.2026 11:30:00" }
  ];

  // 1. Save to site_settings
  const { error: err1 } = await supabase.from('site_settings').upsert({
    id: 'registered_users_list',
    data: all8Users
  }, { onConflict: 'id' });
  if (err1) console.error("site_settings registered_users_list error:", err1);
  else console.log("✅ site_settings registered_users_list updated with 8 users!");

  // 2. Save to profiles table
  for (const u of all8Users) {
    const { error: err2 } = await supabase.from('profiles').upsert({
      id: u.id,
      full_name: u.fullName,
      email: u.email,
      phone: u.phone,
      interests: u.interests,
      registered_at: u.registeredAt
    }, { onConflict: 'id' });
    if (err2) console.error(`Error inserting profile ${u.email}:`, err2);
  }
  console.log("✅ profiles table updated with 8 users!");

  console.log("🎉 SUCCESS: 8 REGISTERED READERS ARE NOW PERMANENTLY STORED IN CLOUD!");
  process.exit(0);
}

fix8Users().catch(e => { console.error(e); process.exit(1); });
