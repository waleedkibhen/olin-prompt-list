const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8').split('\n');

let startLine = -1;
let endLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<!-- Modal Backdrop -->')) {
        startLine = i + 1; // <div className={styles.modalBackdrop}
    }
    if (lines[i].includes('{showCheckout && post.whopPlanId && (')) {
        endLine = i - 2; // the end of modal is a few lines before this
        break;
    }
}

console.log("Start:", startLine, lines[startLine]);
console.log("End:", endLine, lines[endLine]);
