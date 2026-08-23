const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /A new tab will open\. Close it and return to see the unlocked prompt\./g;
code = code.replace(regex, 'A new tab will open. Close it and return here to see the prompt unlocked.');

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Updated note text');
