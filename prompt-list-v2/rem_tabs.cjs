const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const regex = /<div style=\{\{ display: 'flex', gap: '0\.5rem', backgroundColor: 'rgba\(255,255,255,0\.03\)', padding: '0\.25rem', borderRadius: '8px' \}\}>[\s\S]*?<\/div>\r?\n\s*<\/div>/;

code = code.replace(regex, "</div>");
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Removed tab filters from dashboard");
