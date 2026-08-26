const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('displayMonetizationPosts.map'));
console.log(lines.slice(idx, idx + 25).join('\n'));
