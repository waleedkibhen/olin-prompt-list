const fs = require('fs');
const content = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = content.split('\n');
const idx = lines.findIndex(line => line.includes('onSnapshot(') && line.includes('comments'));
if (idx !== -1) {
  console.log(lines.slice(idx - 5, idx + 25).join('\n'));
}
