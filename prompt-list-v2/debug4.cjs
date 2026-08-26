const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');
const commentsStart = code.indexOf('{showComments && (');
const modalEnd = code.indexOf('{showCheckout');
console.log(code.substring(commentsStart, modalEnd));
