const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://czoecvbxstrsfgwsxvog.supabase.co', 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX');

async function removeSentenceFromArticles() {
  const { data: arts, error } = await client.from('articles').select('*');
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (arts && arts.length > 0) {
    console.log(`Scanning ${arts.length} articles in Supabase Cloud to remove the unwanted sentence...`);

    for (const a of arts) {
      let content = a.content || '';
      let excerpt = a.excerpt || '';

      const targetPattern = /<p>\s*Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?\s*<\/p>|Politik ve İktisadi Araştırmalar Merkezi yayın kurulunca hazırlanan özel analiz\.?/gi;

      let modified = false;

      if (targetPattern.test(content)) {
        content = content.replace(targetPattern, '').trim();
        modified = true;
      }

      if (targetPattern.test(excerpt)) {
        excerpt = excerpt.replace(targetPattern, '').trim();
        modified = true;
      }

      if (modified) {
        console.log(`Cleaning sentence from article '${a.id}' (${a.title.substring(0, 30)}...)`);
        await client.from('articles').update({ content, excerpt }).eq('id', a.id);
      }
    }
  }

  console.log('Sentence cleanup complete across all articles!');
}

removeSentenceFromArticles();
