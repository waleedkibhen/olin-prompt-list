const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard/CommentsSection.tsx', 'utf8');
code = code.replace(/i\}/g, ')}');
fs.writeFileSync('src/components/PromptCard/CommentsSection.tsx', code);
