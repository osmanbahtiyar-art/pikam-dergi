const { execSync } = require('child_process');

function inspectGitCommits() {
  console.log("=== INSPECTING ALL COMMITS FROM PAST MONTH ===");
  const commits = execSync('git log --format="%h | %cd | %s" --date=short -n 100').toString();
  console.log(commits);

  console.log("\n=== HISTORICAL ARTICLE AND AUTHOR DEFINITIONS IN GIT ===");
  const diffs = execSync('git log -p -n 40 -- src/data/pikamData.js').toString();
  console.log("Diffs size:", diffs.length);
}

inspectGitCommits();
