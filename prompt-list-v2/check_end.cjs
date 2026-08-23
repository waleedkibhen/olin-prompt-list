const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const lines = code.split('\n');
for (let i = lines.length - 20; i < lines.length; i++) {
    if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
