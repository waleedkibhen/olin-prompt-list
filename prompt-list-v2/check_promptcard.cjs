const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('handleWatchAdToUnlock'));
console.log(lines.slice(Math.max(0, idx - 20), idx + 20).join('\n'));
