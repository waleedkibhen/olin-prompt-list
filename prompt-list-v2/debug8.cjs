const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8').split('\n');

let commentsStartLine = -1;
let commentsEndLine = -1;
for (let i = 678; i <= 1152; i++) {
    if (lines[i].includes('{showComments && (')) {
        commentsStartLine = i;
    }
    // The comments section ends with a `</div>` then `)`
    // Let's find where the comments block ends. It's the `)` that corresponds to `showComments && (`
    // It's probably the line before the closing tags of modalBackdrop.
}
// We can just find the end by looking upwards from 1152
for (let i = 1152; i > commentsStartLine; i--) {
    if (lines[i].includes(')}')) {
        // This might be the end of `showComments && (`
        commentsEndLine = i;
        break;
    }
}

console.log("Comments Start:", commentsStartLine, lines[commentsStartLine]);
console.log("Comments End:", commentsEndLine, lines[commentsEndLine]);
