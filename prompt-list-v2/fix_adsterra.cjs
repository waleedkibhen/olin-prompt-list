const fs = require('fs');
let code = fs.readFileSync('public/adsterra-social-bar.html', 'utf8');

code = code.replace(
  'body { margin: 0; padding: 0; overflow: hidden; background: transparent; }',
  ':root { color-scheme: dark; }\n    body { margin: 0; padding: 0; overflow: hidden; background: transparent; }'
);

fs.writeFileSync('public/adsterra-social-bar.html', code);
console.log("Fixed adsterra html");
