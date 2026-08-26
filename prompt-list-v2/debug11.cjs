const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8').split('\n');
for (let i = 1150; i <= 1175; i++) {
    if (lines[i] !== undefined) console.log(i + ': ' + lines[i]);
}
