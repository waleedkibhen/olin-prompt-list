const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(/borderColor: '#10b981'/g, "borderColor: '#0572F6'");

fs.writeFileSync(p, code);
console.log('fixed border color on share');
