const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const match = code.match(/<section className=\{styles\.kpiGrid\}>\s*<div className=\{styles\.kpiCard\}>\s*<div className=\{styles\.kpiTop\}>\s*<Sparkles[\s\S]*?(?=<\/main>)/);

if (match) {
    console.log("Found monetization block");
    fs.writeFileSync('monetization_block_old.txt', match[0]);
} else {
    console.log("Could not find monetization block");
}
