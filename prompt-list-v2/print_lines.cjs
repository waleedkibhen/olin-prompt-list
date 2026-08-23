const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');
for(let i = 420; i < 445; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
