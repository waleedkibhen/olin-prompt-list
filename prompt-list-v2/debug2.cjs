const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('promptTextContainer'));
console.log(lines.slice(idx - 10, idx + 10).join('\n'));
