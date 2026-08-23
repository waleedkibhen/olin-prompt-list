const fs = require('fs');
let code = fs.readFileSync('monetization_block_old.txt', 'utf8');
const lines = code.split('\n');
for (let i = lines.length - 20; i < lines.length; i++) {
    if (lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
