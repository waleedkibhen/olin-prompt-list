const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  "const whopData = await whopRes.json() as any;",
  "const whopText = await whopRes.text(); let whopData = {}; try { whopData = JSON.parse(whopText); } catch(e) { console.error('Failed to parse whop response:', whopText); throw new Error('Whop API returned non-JSON response'); }"
);

fs.writeFileSync(p, code);
console.log('fixed backend json parsing');
