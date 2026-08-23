const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('skeletonContainer') || lines[i].includes('adDelayComplete') || lines[i].includes('isAdSupported')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
