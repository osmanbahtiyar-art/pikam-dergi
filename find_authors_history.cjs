const fs = require('fs');
const execSync = require('child_process').execSync;

try {
  console.log("=== GIT COMMITS FROM LAST 10 COMMITS ===");
  const gitLog = execSync('git log -n 10 --oneline', { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString();
  console.log(gitLog);

  console.log("\n=== CHECKING PAST COMMITS FOR AUTHORS ===");
  const pastData = execSync('git show main~5:src/data/pikamData.js', { cwd: 'C:\\Users\\HUAWEI\\.gemini\\antigravity\\scratch\\pikam-dergi' }).toString();
  console.log("Past pikamData.js authors count / snippet:");
  const match = pastData.match(/authors:\s*\[([\s\S]*?)\]\s*,/);
  if (match) {
    console.log(match[1].slice(0, 1500));
  } else {
    console.log("No match in main~5");
  }
} catch (err) {
  console.error(err.message);
}
