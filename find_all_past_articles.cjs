const { execSync } = require('child_process');

function findHistoricalData() {
  console.log("=== EXTRACTING ALL HISTORICAL ARTICLES AND DATA FROM GIT HISTORY ===");
  
  // Get list of all commit hashes
  const commits = execSync('git log --format="%h|%cd|%s" --date=short').toString().trim().split('\n');
  
  const allArticlesMap = new Map();
  const allAuthorsMap = new Map();

  for (const line of commits) {
    const [hash, date, msg] = line.split('|');
    try {
      const content = execSync(`git show ${hash}:src/data/pikamData.js`, { maxBuffer: 10 * 1024 * 1024 }).toString();
      
      // Look for articles
      const articleMatches = content.match(/title:\s*["'`](.*?)["'`]/g);
      if (articleMatches) {
        articleMatches.forEach(m => {
          const title = m.replace(/title:\s*["'`](.*?)["'`]/, '$1');
          if (title && !allArticlesMap.has(title)) {
            allArticlesMap.set(title, { firstSeenHash: hash, date, msg });
          }
        });
      }

      // Look for author names
      const authorMatches = content.match(/name:\s*["'`](.*?)["'`]/g);
      if (authorMatches) {
        authorMatches.forEach(m => {
          const name = m.replace(/name:\s*["'`](.*?)["'`]/, '$1');
          if (name && !allAuthorsMap.has(name)) {
            allAuthorsMap.set(name, { firstSeenHash: hash, date, msg });
          }
        });
      }
    } catch (e) {
      // ignore
    }
  }

  console.log("\n--- HISTORICAL ARTICLES FOUND IN GIT HISTORY ---");
  for (const [title, info] of allArticlesMap.entries()) {
    console.log(`• "${title}" (Kayıt Tarihi: ${info.date} | Commit: ${info.firstSeenHash})`);
  }

  console.log("\n--- HISTORICAL TEAM MEMBERS / AUTHORS FOUND IN GIT HISTORY ---");
  for (const [name, info] of allAuthorsMap.entries()) {
    console.log(`• "${name}" (Kayıt Tarihi: ${info.date} | Commit: ${info.firstSeenHash})`);
  }
}

findHistoricalData();
