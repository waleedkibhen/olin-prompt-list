const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(`if (DIRECT_LINK_URL && DIRECT_LINK_URL !== 'https://google.com')`, `if (DIRECT_LINK_URL && (DIRECT_LINK_URL as string) !== 'https://google.com')`);

fs.writeFileSync(p, code);
