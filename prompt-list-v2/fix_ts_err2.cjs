const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');
const start = lines.findIndex(l => l.includes(") : (")) + 1; // Actually there are many ") : ("

let targetIdx = -1;
for (let i = 1010; i < 1025; i++) {
    if (lines[i] && lines[i].includes(") : (")) {
        targetIdx = i;
        break;
    }
}

if (targetIdx !== -1) {
    lines.splice(targetIdx + 1, 0, "                  <>");
}

let endIdx = -1;
for (let i = 1030; i < 1038; i++) {
    if (lines[i] && lines[i].includes(")}")) {
        if (lines[i-1] && lines[i-1].includes(")}")) {
            endIdx = i;
            break;
        }
    }
}

if (endIdx !== -1) {
    lines.splice(endIdx, 0, "                  </>");
}

fs.writeFileSync('src/components/PromptCard.tsx', lines.join('\n'));
console.log('Fixed TS Error (Manual splices)');
