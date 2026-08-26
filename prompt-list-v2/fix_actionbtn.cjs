const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(
  'className={styles.actionBtn}',
  'className={styles.actionIconBtn}'
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed actionIconBtn");
