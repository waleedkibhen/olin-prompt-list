const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8').split('\n');
for (let i = 1010; i <= 1025; i++) {
    console.log(i + ': ' + lines[i]);
}
