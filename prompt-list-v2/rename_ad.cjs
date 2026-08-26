const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(/Ad Unlock/g, "Ad-Supported");
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Renamed Ad Unlock to Ad-Supported");
