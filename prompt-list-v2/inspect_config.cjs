const fs = require('fs');
let code = fs.readFileSync('src/lib/config.ts', 'utf8');
console.log(code);
