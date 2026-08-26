const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(/<!-- Monetag In-Page Push Banner[\s\S]*?<\/script>\r?\n/, '');
fs.writeFileSync('index.html', code);
console.log("Removed from index.html");
