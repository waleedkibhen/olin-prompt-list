const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('const handleWatchAdToUnlock ='));
if (startIdx !== -1) {
    let endIdx = startIdx;
    let braces = 0;
    let foundStart = false;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('{')) {
            braces += (lines[i].match(/\{/g) || []).length;
            foundStart = true;
        }
        if (lines[i].includes('}')) {
            braces -= (lines[i].match(/\}/g) || []).length;
        }
        if (foundStart && braces === 0) {
            endIdx = i;
            break;
        }
    }
    lines.splice(startIdx, endIdx - startIdx + 1);
    fs.writeFileSync('src/components/PromptCard.tsx', lines.join('\n'));
    console.log("Deleted handler block!");
} else {
    console.log("Not found.");
}
