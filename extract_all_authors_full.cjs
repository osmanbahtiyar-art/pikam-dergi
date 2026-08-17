const execSync = require('child_process').execSync;

try {
  const logHashes = execSync('git log -n 50 --format="%H"', { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString().trim().split('\n');

  const allAuthorsMap = new Map();

  for (const hash of logHashes) {
    try {
      const content = execSync(`git show ${hash}:src/data/pikamData.js`, { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString();
      const match = content.match(/authors:\s*\[([\s\S]*?)\]\s*,/);
      if (match) {
        // match object blocks
        const blocks = match[1].split('},');
        for (let b of blocks) {
          b = b.trim();
          if (!b.endsWith('}')) b += '}';
          const nameMatch = b.match(/name:\s*"([^"]+)"/);
          if (nameMatch) {
            const name = nameMatch[1];
            if (!allAuthorsMap.has(name)) {
              allAuthorsMap.set(name, b);
            }
          }
        }
      }
    } catch (e) {}
  }

  console.log(`=== FOUND ${allAuthorsMap.size} UNIQUE AUTHORS ACROSS ALL COMMITS ===\n`);
  for (const [name, block] of allAuthorsMap.entries()) {
    console.log(`AUTHOR: ${name}`);
    console.log(block);
    console.log('-----------------------------------');
  }

} catch (err) {
  console.error(err);
}
