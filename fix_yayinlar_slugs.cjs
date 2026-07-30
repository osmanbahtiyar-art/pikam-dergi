const { createClient } = require('@supabase/supabase-js');
const client = createClient('https://czoecvbxstrsfgwsxvog.supabase.co', 'sb_publishable_69J5Pj_VCgTGc53R5i9IEA_FoR93LvX');

async function fixYayinlarSlugs() {
  const { data: arts, error } = await client.from('articles').select('*');
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (arts && arts.length > 0) {
    console.log(`Found ${arts.length} articles in Supabase Cloud. Converting IDs to yayinlar-N format...`);
    
    // Sort articles by existing ID or creation order if possible
    let count = 1;
    for (const a of arts) {
      const newId = `yayinlar-${count}`;
      count++;

      if (a.id === newId) {
        console.log(`Article already has ID '${newId}' (${a.title.substring(0, 30)}...)`);
        continue;
      }

      console.log(`Converting '${a.id}' -> '${newId}' (${a.title.substring(0, 30)}...)`);

      // Delete old row
      await client.from('articles').delete().eq('id', a.id);

      // Insert new row with yayinlar-N ID
      const newArt = { ...a, id: newId };
      await client.from('articles').insert([newArt]);
    }
  }

  console.log('All articles converted to yayinlar-N format successfully!');
}

fixYayinlarSlugs();
