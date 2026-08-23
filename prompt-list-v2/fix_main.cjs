const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(/<\/main><\/main>/g, '</main>');

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed double main');
