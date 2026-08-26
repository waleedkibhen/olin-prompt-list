const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import\('@\/pages\/CreatorDashboardPage'\)/,
  "import('@/pages/CreatorDashboard')"
);

fs.writeFileSync('src/App.tsx', code);
