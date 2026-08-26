const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
lines.forEach((l, i) => { if (l.includes('setIsUnlocked(')) console.log(`Line ${i}: ${l}`); });
