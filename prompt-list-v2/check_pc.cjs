const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
console.log("Lines 228-260:");
console.log(lines.slice(228, 260).join('\n'));
