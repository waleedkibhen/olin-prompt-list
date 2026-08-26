const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('monetag'));
if (idx !== -1) console.log(lines.slice(idx - 2, idx + 5).join('\n'));
else console.log("Monetag script completely gone from PromptCard!");
