const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('setIsUnlocked(isFree || isOwner'));
console.log(lines.slice(idx - 10, idx + 5).join('\n'));
