const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('Pay ${post.price'));
if (start !== -1) console.log(lines.slice(start - 5, start + 5).join('\n'));
