const fs = require('fs');
const path = require('path');
const p = path.join('src', 'lib', 'config.ts');
let code = fs.readFileSync(p, 'utf8');

code = code.replace("export const ENABLE_MONETIZATION = false;", "export const ENABLE_MONETIZATION = true;");

fs.writeFileSync(p, code);
console.log('Enabled monetization');
