const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('const monetizationStats = React.useMemo'));
console.log(lines.slice(idx, idx + 40).join('\n'));
