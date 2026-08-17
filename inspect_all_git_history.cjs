const execSync = require('child_process').execSync;

try {
  const commits = execSync('git log -n 40 --format="%H %s"', { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString().trim().split('\n');
  console.log(`Found ${commits.length} commits. Checking...`);

  commits.forEach(c => {
    const [hash, ...rest] = c.split(' ');
    const msg = rest.join(' ');
    try {
      const show = execSync(`git show ${hash}:src/data/pikamData.js`, { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString();
      const match = show.match(/authors:\s*\[([\s\S]*?)\]\s*,/);
      if (match && match[1].includes('name')) {
        console.log(`\n--- COMMIT ${hash.slice(0, 7)}: ${msg} ---`);
        console.log(match[1].trim());
      }
    } catch {
      // file might not exist in that commit or format different
    }
  });
} catch (e) {
  console.error(e);
}
