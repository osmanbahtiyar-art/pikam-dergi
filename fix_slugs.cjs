const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://czoecvbxstrsfgwsxvog.supabase.co', 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX');

function generateAuthorSlug(authorName, existingArticles) {
  existingArticles = existingArticles || [];
  const cleanName = authorName.replace(/Prof\.|Dr\.|Doç\.|Arş\.|Gör\.|Öğr\.|Üyesi|Uzman/gi, '').trim();
  const trMap = { 'ç':'c', 'Ç':'c', 'ğ':'g', 'Ğ':'g', 'ı':'i', 'I':'i', 'İ':'i', 'i':'i', 'ö':'o', 'Ö':'o', 'ş':'s', 'Ş':'s', 'ü':'u', 'Ü':'u' };
  const slugified = cleanName.split('').map(c => trMap[c] || c).join('').toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  
  const count = existingArticles.filter(a => (a.id || '').indexOf(slugified + '-') === 0).length + 1;
  return (slugified || 'yazar') + '-' + count;
}

async function fixSlugs() {
  const { data: arts, error } = await client.from('articles').select('*');
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  const updatedArticles = [];
  
  if (arts) {
    for (const a of arts) {
      const authorName = typeof a.author === 'string' ? a.author : (a.author ? a.author.name : 'Analist');
      
      // Check if ID is already in new slug format (e.g. silanur-gor-1)
      if (a.id && /^[a-z0-9]+-[a-z0-9]+-\d+$/.test(a.id)) {
        updatedArticles.push(a);
        continue;
      }

      const newId = generateAuthorSlug(authorName, updatedArticles);
      console.log(`Renaming article '${a.id}' (${a.title.substring(0, 30)}...) -> '${newId}'`);

      // Delete old ID and insert with new ID
      await client.from('articles').delete().eq('id', a.id);
      
      const newArt = { ...a, id: newId };
      await client.from('articles').insert([newArt]);
      updatedArticles.push(newArt);
    }
  }

  console.log('All articles updated with author slugs successfully!');
}

fixSlugs();
