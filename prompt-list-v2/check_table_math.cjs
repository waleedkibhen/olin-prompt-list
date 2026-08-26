const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('revenue = ((unlocks / globalAdPool'));
if (idx !== -1) {
  console.log(lines.slice(idx - 5, idx + 5).join('\n'));
} else {
  console.log("No table revenue math found!");
}
