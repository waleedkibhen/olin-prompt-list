const fs = require('fs');
const p = 'src/pages/UnlockAdPage.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(/#10b981/g, "#1E50FF");

fs.writeFileSync(p, code);
console.log('replaced all green to blue in unlockadpage');
