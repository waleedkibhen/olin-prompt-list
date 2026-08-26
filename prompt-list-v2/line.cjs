const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard/PromptModal.tsx', 'utf8').split('\n');
console.log('Line 914 is: [' + lines[913] + ']');
