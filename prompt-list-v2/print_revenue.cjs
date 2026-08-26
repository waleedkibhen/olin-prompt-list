const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const idx = code.lastIndexOf('revenue');
const lines = code.split('\n');
const lineIdx = lines.findIndex(l => l.includes('revenue !== null ?'));
if (lineIdx !== -1) {
  for (let i = lineIdx - 2; i < lineIdx + 5; i++) {
    console.log(lines[i]);
  }
} else {
  console.log('revenue ternary not found');
}
