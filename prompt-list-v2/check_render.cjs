const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('promptTextContainer'));
console.log(lines.slice(idx - 15, idx + 10).join('\n'));
