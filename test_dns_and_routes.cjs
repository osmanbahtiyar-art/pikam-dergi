const dns = require('dns').promises;
const https = require('https');

async function testDns() {
  console.log("=== DNS RESOLUTION TEST ===");
  try {
    const aRecords = await dns.resolve4('pikamdergi.com');
    console.log("pikamdergi.com A records:", aRecords);
  } catch (err) {
    console.error("pikamdergi.com A record error:", err.message);
  }

  try {
    const wwwRecords = await dns.resolve4('www.pikamdergi.com');
    console.log("www.pikamdergi.com A records:", wwwRecords);
  } catch (err) {
    console.error("www.pikamdergi.com A record error:", err.message);
  }

  try {
    const cnameRecords = await dns.resolveCname('www.pikamdergi.com');
    console.log("www.pikamdergi.com CNAME records:", cnameRecords);
  } catch (err) {
    console.error("www.pikamdergi.com CNAME record error:", err.message);
  }

  process.exit(0);
}

testDns();
