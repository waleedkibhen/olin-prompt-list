const fs = require('fs');
const path = require('path');
const p = path.join('src', 'lib', 'mockData.ts');
let code = fs.readFileSync(p, 'utf8');

code = code.replace("monetizationType?: 'free' | 'ad_supported' | 'subscribers_only';", "monetizationType?: 'free' | 'ad_supported' | 'subscribers_only' | 'charge';");

fs.writeFileSync(p, code);
console.log('Updated mockData');
