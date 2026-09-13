const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://czoecvbxstrsfgwsxvog.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportAllSupabaseData() {
  console.log("=== EXPORTING ALL SUPABASE CLOUD DATA TO LOCAL FRONTEND DATA ===");

  const [
    { data: cloudProfiles },
    { data: cloudComments },
    { data: cloudAuthors },
    { data: cloudSettings },
    { data: cloudIssues },
    { data: cloudArticles }
  ] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('article_comments').select('*'),
    supabase.from('authors').select('*'),
    supabase.from('site_settings').select('*'),
    supabase.from('e_dergi_issues').select('*'),
    supabase.from('articles').select('*')
  ]);

  const exportObj = {
    timestamp: new Date().toISOString(),
    profiles: cloudProfiles || [],
    comments: cloudComments || [],
    authors: cloudAuthors || [],
    settings: cloudSettings || [],
    issues: cloudIssues || [],
    articles: cloudArticles || []
  };

  // 1. Save full raw backup JSON file
  const backupPath = path.join(__dirname, 'src', 'data', 'supabase_export_backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(exportObj, null, 2), 'utf8');
  console.log(`✅ Raw Supabase Backup saved to: ${backupPath}`);

  // 2. Extract clean merged data for pikamData.js
  const authorsList = (cloudSettings && cloudSettings.find(s => s.id === 'authors_ordered_list'))?.data || cloudAuthors || [];
  const articlesList = (cloudSettings && cloudSettings.find(s => s.id === 'articles_ordered_list'))?.data || cloudArticles || [];
  const heroFeatured = (cloudSettings && cloudSettings.find(s => s.id === 'hero_featured'))?.data || null;
  const kunyeData = (cloudSettings && cloudSettings.find(s => s.id === 'kunye_data'))?.data || null;
  const headerData = (cloudSettings && cloudSettings.find(s => s.id === 'header_data'))?.data || null;
  const footerData = (cloudSettings && cloudSettings.find(s => s.id === 'footer_data'))?.data || null;
  const sectionVisibility = (cloudSettings && cloudSettings.find(s => s.id === 'section_visibility'))?.data || null;
  const navVisibility = (cloudSettings && cloudSettings.find(s => s.id === 'nav_visibility'))?.data || null;
  const adminNotes = (cloudSettings && cloudSettings.find(s => s.id === 'admin_notes_list'))?.data || [];
  const newsletterSubs = (cloudSettings && cloudSettings.find(s => s.id === 'newsletter_subscribers'))?.data || [];

  console.log("Summary of Exported Data:");
  console.log(`- Articles: ${articlesList.length}`);
  console.log(`- Authors: ${authorsList.length}`);
  console.log(`- E-Dergi Issues: ${cloudIssues ? cloudIssues.length : 0}`);
  console.log(`- Profiles / Registered Users: ${cloudProfiles ? cloudProfiles.length : 0}`);
  console.log(`- Newsletter Subscribers: ${newsletterSubs.length}`);

  process.exit(0);
}

exportAllSupabaseData().catch(e => { console.error(e); process.exit(1); });
