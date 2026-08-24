const https = require('https');
const http = require('http');

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    const client = urlStr.startsWith('https') ? https : http;
    const req = client.get(urlStr, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      console.log(`[${urlStr}] STATUS: ${res.statusCode}`);
      console.log(`[${urlStr}] HEADERS:`, res.headers);
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        console.log(`[${urlStr}] BODY LENGTH: ${data.length}`);
        console.log(`[${urlStr}] BODY SNIPPET:`, data.slice(0, 300));
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.error(`[${urlStr}] ERROR:`, err.message);
      resolve(null);
    });

    req.setTimeout(8000, () => {
      console.error(`[${urlStr}] TIMEOUT`);
      req.destroy();
      resolve(null);
    });
  });
}

async function run() {
  await checkUrl('https://pikamdergi.com');
  await checkUrl('http://pikamdergi.com');
  await checkUrl('https://www.pikamdergi.com');
  process.exit(0);
}

run();
