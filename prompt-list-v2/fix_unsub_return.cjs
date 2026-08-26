const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

if (!code.includes('unsubAdPool();')) {
  code = code.replace(
    'unsubPayouts();',
    'unsubPayouts();\n      unsubAdPool();'
  );
  fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
  console.log("Added unsubAdPool to return");
}
