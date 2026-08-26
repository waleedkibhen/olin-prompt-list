const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(/limit\(100\)/, "limit(250)");

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Increased limit to 250");
