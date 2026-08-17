const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  try {
    const { data: articles, error: err1 } = await supabase.from('articles').select('id, title, author');
    console.log("Articles count:", articles ? articles.length : 0);
    if (articles) console.log("Articles:", articles.map(a => a.title));
    
    const { data: settings, error: err2 } = await supabase.from('site_settings').select('id, data');
    console.log("Settings IDs:", settings ? settings.map(s => s.id) : null);

    const hero = settings ? settings.find(s => s.id === 'hero_featured') : null;
    console.log("Hero Featured in Cloud:", hero ? hero.data.title : "NONE");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    process.exit(0);
  }
}

main();
