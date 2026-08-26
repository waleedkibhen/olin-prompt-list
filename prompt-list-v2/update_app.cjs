const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /import CreatorDashboardPage from '\.\/pages\/CreatorDashboardPage';/,
  "import CreatorDashboardPage from './pages/CreatorDashboard';"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx");
