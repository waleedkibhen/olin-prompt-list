const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');
for(let i=610; i<680; i++) {
    if(lines[i] !== undefined) console.log(`${i+1}: ${lines[i]}`);
}
