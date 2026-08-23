const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
    /const DIRECT_LINK_URL = 'https:\/\/www\.effectivecpmnetwork\.com\/k1qybg57\?key=41b37323a01727c9cc93104afa6c1671';/g,
    "const DIRECT_LINK_URL: string = 'https://www.effectivecpmnetwork.com/k1qybg57?key=41b37323a01727c9cc93104afa6c1671';"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed TS literal type issue');
