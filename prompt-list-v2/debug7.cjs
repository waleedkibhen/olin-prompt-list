const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8').split('\n');

let startLine = -1;
let endLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{isModalOpen && (')) {
        startLine = i + 1;
    }
    if (lines[i].includes('{showCheckout && post.whopPlanId && (')) {
        endLine = i - 1; // The `)` or `)}` before it
        // We need to backtrack to the closing `</div>` of the modalBackdrop
        while(endLine > 0 && !lines[endLine].includes('</div>')) {
           endLine--;
        }
        break;
    }
}

console.log("Start:", startLine, lines[startLine]);
console.log("End:", endLine, lines[endLine]);
