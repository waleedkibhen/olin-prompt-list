const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard/CommentsSection.tsx', 'utf8');
code = code.replace(/\{ eply/g, '{ reply');
fs.writeFileSync('src/components/PromptCard/CommentsSection.tsx', code);
