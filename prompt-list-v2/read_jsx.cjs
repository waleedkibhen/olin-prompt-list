const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const headerStart = code.indexOf('<header className={styles.header}>');
const endOfFile = code.length;
console.log(code.substring(headerStart, headerStart + 2000));
