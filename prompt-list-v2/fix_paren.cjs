const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard/CommentsSection.tsx', 'utf8');
code = code.replace(/\s+\)\s+<\/div>/, '\n                    )}\n                  </div>');
fs.writeFileSync('src/components/PromptCard/CommentsSection.tsx', code);
