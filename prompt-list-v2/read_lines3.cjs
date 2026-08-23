const fs = require('fs');
const lines = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8').split('\n');
for (let i = 230; i < 280; i++) {
    if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
