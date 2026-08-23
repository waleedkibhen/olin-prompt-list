const fs = require('fs');
const lines = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('const revenue = isPaid')) {
        for(let j=0; j<35; j++) {
            console.log(`${i+j+1}: ${lines[i+j]}`);
        }
    }
});
