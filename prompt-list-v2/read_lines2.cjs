const fs = require('fs');
const lines = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8').split('\n');
for (let i = 290; i < 448; i++) {
    if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
