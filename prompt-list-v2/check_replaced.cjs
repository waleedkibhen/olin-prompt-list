const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('const handleWatchAdToUnlock ='));
console.log(lines.slice(idx, idx + 10).join('\n'));
