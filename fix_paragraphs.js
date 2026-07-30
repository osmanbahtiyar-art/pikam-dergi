const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://czoecvbxstrsfgwsxvog.supabase.co', 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX');

const formatParagraphsToHtml = (text) => {
  if (!text) return '';
  const cleanText = text.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n');
  const paragraphs = cleanText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  return paragraphs
    .map(p => `<p style="margin-bottom: 1.4rem; line-height: 1.8;">${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

async function fixArticleParagraphs() {
  const { data: arts, error } = await client.from('articles').select('*');
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }
  if (arts) {
    for (const a of arts) {
      const formatted = formatParagraphsToHtml(a.content || a.excerpt);
      console.log('Article:', a.id, '| Formatted <p> count:', (formatted.match(/<p/g) || []).length);
      const { error: updErr } = await client.from('articles').update({ content: formatted }).eq('id', a.id);
      if (updErr) console.error('Update error for', a.id, updErr);
    }
  }
}
fixArticleParagraphs();
