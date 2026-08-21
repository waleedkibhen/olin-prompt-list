const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /const DIRECT_LINK_URL = 'https:\/\/google\.com'; \/\/ PLACEHOLDER/,
  "const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/k1qybg57?key=41b37323a01727c9cc93104afa6c1671';"
);

fs.writeFileSync(p, code);
console.log('injected smartlink');
