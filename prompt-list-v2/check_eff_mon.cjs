const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(258, 265).join('\n'));
