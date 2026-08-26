const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');
code = code.replace(/\/\* Discovery Feed Ad Isolation \*\/[\s\S]*?z-index: -9999 !important;\r?\n\}/, '');
fs.writeFileSync('src/index.css', code);
console.log("Removed old push css isolation.");
