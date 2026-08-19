const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function purgeExtra() {
  console.log("Purging all authors table rows except exact 9 IDs...");

  const exact9Ids = [
    "auth-1786866647845", // Zeynep Sare Ağca
    "auth-1785333313380", // İrem Kumral
    "auth-12",            // Nisa Bayır
    "auth-1785449849542", // Eda Akpınar
    "auth-1785450479146", // Sılanur Gör
    "auth-2",             // Oğuzhan Kale
    "auth-test-1",        // Doğancan Tekin
    "auth-4",             // Emre Gürdağ
    "auth-10"             // Ayça Sude Kaya
  ];

  const { data: allAuthors } = await supabase.from('authors').select('id, name');
  if (allAuthors) {
    console.log(`Current authors table rows: ${allAuthors.length}`);
    for (const a of allAuthors) {
      if (!exact9Ids.includes(a.id)) {
        await supabase.from('authors').delete().eq('id', a.id);
        console.log(`Deleted extra row: ${a.name} (id: ${a.id})`);
      }
    }
  }

  const { data: remaining } = await supabase.from('authors').select('id, name');
  console.log(`\nRemaining authors table rows: ${remaining ? remaining.length : 0}`);
  if (remaining) {
    console.log("Names:", remaining.map(r => r.name));
  }

  process.exit(0);
}

purgeExtra().catch(e => { console.error(e); process.exit(1); });
