const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 850; i < 1050; i++) {
  if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
