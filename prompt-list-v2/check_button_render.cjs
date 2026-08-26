const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('effectiveMonetization === \'subscribers_only\''));
console.log(lines.slice(start - 5, start + 30).join('\n'));
