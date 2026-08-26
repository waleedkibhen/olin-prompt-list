const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard/PromptModal.tsx', 'utf8').split('\n');
console.log('Lines 910-920:');
for(let i=910; i<920; i++) console.log((i+1) + ': ' + lines[i]);
console.log('\nLines 1090-1115:');
for(let i=1090; i<1115; i++) console.log((i+1) + ': ' + lines[i]);
