const fs = require('fs');
const content = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

fs.writeFileSync('C:/Users/ACER/.gemini/antigravity/brain/ee7b1da3-3645-4699-8777-9ef747901d26/scratch/extract.cjs', `
const fs = require('fs');
const content = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
// I will just use manual copy/paste or regex inside the node script to split the file.
`);
