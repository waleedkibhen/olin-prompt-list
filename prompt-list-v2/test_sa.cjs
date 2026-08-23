const fs = require('fs');

async function test() {
  const envVar = process.env.FIREBASE_SERVICE_ACCOUNT;
  console.log("Env var exists:", !!envVar);
  if (!envVar) {
    const raw = fs.readFileSync('temp_sa.json', 'utf8');
    try {
      const parsed = JSON.parse(raw);
      console.log("Parsing temp_sa.json success! Keys:", Object.keys(parsed));
      console.log("Private key snippet:", parsed.private_key.substring(0, 50));
    } catch(e) {
      console.log("Parse error:", e.message);
    }
  }
}
test();
