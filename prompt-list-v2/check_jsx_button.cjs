const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const starts = [];
lines.forEach((l, i) => { if (l.includes('effectiveMonetization === \'subscribers_only\'')) starts.push(i); });
const jsxStart = starts[starts.length - 1]; // usually the later one is the JSX
console.log(lines.slice(jsxStart - 5, jsxStart + 30).join('\n'));
