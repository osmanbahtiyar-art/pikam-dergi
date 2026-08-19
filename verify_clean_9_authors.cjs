const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verify9() {
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'authors_ordered_list').single();
  console.log("=== SUPABASE CLOUD authors_ordered_list COUNT ===");
  if (settings && settings.data) {
    console.log(`Count: ${settings.data.length}`);
    console.log("Names:", settings.data.map(a => a.name));
  } else {
    console.log("No settings data found");
  }

  const { data: authorsTable } = await supabase.from('authors').select('id, name');
  console.log("\n=== SUPABASE CLOUD authors TABLE COUNT ===");
  if (authorsTable) {
    console.log(`Count: ${authorsTable.length}`);
    console.log("Names:", authorsTable.map(a => a.name));
  }

  process.exit(0);
}

verify9().catch(e => { console.error(e); process.exit(1); });
