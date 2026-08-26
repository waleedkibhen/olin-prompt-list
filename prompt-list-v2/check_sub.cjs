const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('let subUnlocked = false;'));
if(idx !== -1) console.log(lines.slice(idx - 5, idx + 10).join('\n'));
else console.log("Not found!");
