const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard/PromptModal.tsx', 'utf8');
code = code.replace(/<>\s*\(\s*<>/, '<>\n                          <>\n');
code = code.replace(/<\/>\s*\)\}\s*<\/>/g, '</>\n                        </>');
code = code.replace(/<\/>\s*\)\}/g, '</>\n                        ');
fs.writeFileSync('src/components/PromptCard/PromptModal.tsx', code);
