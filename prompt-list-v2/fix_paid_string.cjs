const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(
  "Paid (\\$\\{post.price?.toFixed(2) || '1.99'\\})",
  "Paid (${post.price?.toFixed(2) || '1.99'})"
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed paid string interpolation");
