const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('originalAddEventListener'));
if(idx !== -1) console.log(lines.slice(idx - 2, idx + 5).join('\n'));
else console.log("Proxy completely gone!");
