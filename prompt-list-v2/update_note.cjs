const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /<ExternalLink size=\{14\} \/> A new tab will open\. Close it and return here to unlock\./g;
code = code.replace(regex, 'A new tab will open. Close it and return to see the unlocked prompt.');

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Updated note text and removed icon');
