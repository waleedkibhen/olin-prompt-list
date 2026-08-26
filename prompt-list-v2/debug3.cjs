const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');
const commentsStart = code.indexOf('{showComments && (');
const commentsEnd = code.indexOf('<!-- Modal Backdrop -->') - 10;
// We actually want to find where `showComments` ends. 
console.log(code.substring(commentsStart, commentsStart + 100));
