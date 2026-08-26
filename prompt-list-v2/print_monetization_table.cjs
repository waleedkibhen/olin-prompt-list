const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const idx = code.indexOf('<th>Monetization</th>');
console.log(code.substring(idx, idx + 1500));
