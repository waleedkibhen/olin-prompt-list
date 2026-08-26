const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('checkAccess'));
console.log(lines.slice(idx - 5, idx + 20).join('\n'));
