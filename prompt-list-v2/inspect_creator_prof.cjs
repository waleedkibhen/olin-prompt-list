const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorProfilePage.tsx', 'utf8');
const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('monetizationType')) {
    console.log(`${i+1}: ${lines[i]}`);
  }
}
