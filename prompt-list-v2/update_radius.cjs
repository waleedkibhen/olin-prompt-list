const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');

code = code.replace(/border-radius: 16px;/g, 'border-radius: 12px;');

fs.writeFileSync('src/components/PromptCard.module.css', code);
console.log("Updated border-radius in PromptCard.module.css");
