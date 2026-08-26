const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
  /<div className=\{styles\.skeletonHeader\}>\s*<div className=\{styles\.skeletonDot\} \/>\s*<span className=\{styles\.skeletonLabel\}>Unlocking generative prompt\.\.\.<\/span>\s*<\/div>/g,
  ''
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Removed skeleton header text');
