const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('effectiveMonetization') && l.includes('const')) {
        console.log(`${i+1}: ${l}`);
    }
});
