const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 1010; i < 1030; i++) {
  if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
