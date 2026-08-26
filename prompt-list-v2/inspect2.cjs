const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard/CommentsSection.tsx', 'utf8').split('\n');
console.log('Lines 150-180:');
for(let i=150; i<180; i++) console.log((i+1) + ': ' + lines[i]);
