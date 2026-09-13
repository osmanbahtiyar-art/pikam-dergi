const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectCloud() {
  console.log("=== INSPECTING CURRENT SUPABASE CLOUD DATABASE ===");
  
  const { data: articles } = await supabase.from('articles').select('id, title, author, date, hidden');
  console.log("\n--- ARTICLES TABLE IN CLOUD ---");
  if (articles) {
    console.log(`Count: ${articles.length}`);
    articles.forEach(a => console.log(`• [${a.id}] "${a.title}" - Yazar: ${a.author} (Hidden: ${a.hidden})`));
  }

  const { data: authors } = await supabase.from('authors').select('id, name, role');
  console.log("\n--- AUTHORS TABLE IN CLOUD ---");
  if (authors) {
    console.log(`Count: ${authors.length}`);
    authors.forEach(a => console.log(`• [${a.id}] ${a.name} - ${a.role}`));
  }

  const { data: settings } = await supabase.from('site_settings').select('*');
  console.log("\n--- SITE SETTINGS IN CLOUD ---");
  if (settings) {
    settings.forEach(s => {
      if (Array.isArray(s.data)) {
        console.log(`• Setting ID: "${s.id}" -> Array of ${s.data.length} items`);
      } else {
        console.log(`• Setting ID: "${s.id}" -> Object keys:`, Object.keys(s.data || {}));
      }
    });
  }

  const { data: issues } = await supabase.from('e_dergi_issues').select('id, issuenumber, theme');
  console.log("\n--- E-DERGI ISSUES IN CLOUD ---");
  if (issues) {
    console.log(`Count: ${issues.length}`);
    issues.forEach(i => console.log(`• Sayı: ${i.issuenumber} - Tema: ${i.theme}`));
  }

  process.exit(0);
}

inspectCloud().catch(e => { console.error(e); process.exit(1); });
