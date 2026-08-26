const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
code = code.replace(/<!-- Monetag Vignette Ad Script \(Global\) -->\r?\n\s*<script>\(function\(s\).*?<\/script>\r?\n/, '');
fs.writeFileSync('index.html', code);
console.log("Removed from index.html");
