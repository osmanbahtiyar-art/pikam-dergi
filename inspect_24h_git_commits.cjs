const execSync = require('child_process').execSync;

try {
  const gitLog = execSync('git log -n 100 --format="%H %s"', { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString().trim().split('\n');
  console.log(`Searching across ${gitLog.length} git commits for all author variations...`);

  const authorMap = new Map();

  gitLog.forEach(line => {
    const [hash] = line.split(' ');
    try {
      const show = execSync(`git show ${hash}:src/data/pikamData.js`, { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString();
      const match = show.match(/authors:\s*\[([\s\S]*?)\]\s*,/);
      if (match) {
        // parse JSON-like objects
        const rawText = match[1];
        const nameMatches = rawText.matchAll(/name:\s*"([^"]+)"/g);
        for (const nm of nameMatches) {
          if (!authorMap.has(nm[1])) {
            authorMap.set(nm[1], { hash, snippet: nm[0] });
          }
        }
      }
    } catch (e) {
      // commit might not have pikamData.js
    }
  });

  console.log(`Found ${authorMap.size} unique author names in 24h git history:`);
  for (const [name, info] of authorMap.entries()) {
    console.log(`- ${name} (First found in ${info.hash.slice(0, 7)})`);
  }

} catch (err) {
  console.error(err);
}
