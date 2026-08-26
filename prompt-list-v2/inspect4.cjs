const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard/PromptModal.tsx', 'utf8').split('\n');
console.log('Lines 160-180:');
for(let i=160; i<180; i++) console.log((i+1) + ': ' + lines[i]);
console.log('\nLines 280-300:');
for(let i=280; i<300; i++) console.log((i+1) + ': ' + lines[i]);
