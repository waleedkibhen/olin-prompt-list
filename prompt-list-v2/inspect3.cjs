const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard/CommentsSection.tsx', 'utf8').split('\n');
console.log('Lines 30-50:');
for(let i=30; i<50; i++) console.log((i+1) + ': ' + lines[i]);
