const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const matches = code.match(/monetizationType[^\n]+/g);
console.log('CreatorDashboardPage matches:', matches);
