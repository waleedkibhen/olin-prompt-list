const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(
  "$\\{monetizationStats.totalRevenue.toFixed(2)}",
  "${monetizationStats.totalRevenue.toFixed(2)}"
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed template string");
