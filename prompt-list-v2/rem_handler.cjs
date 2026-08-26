const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?setTimeout\(\(\) => setAdDelayComplete\(true\), 1500\);\r?\n\s*\}/;

code = code.replace(regex, "");
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Removed handler");
