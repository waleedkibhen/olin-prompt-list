const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const uiIdx = lines.findIndex(l => l.includes('{isWatchingAd ?'));
console.log("UI block found at line: " + uiIdx);
