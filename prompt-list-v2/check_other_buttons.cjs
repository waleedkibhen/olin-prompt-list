const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('effectiveMonetization === \'charge\''));
if(start !== -1) console.log(lines.slice(start - 2, start + 10).join('\n'));
