const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(`window.location.href === 'https://google.com'`, `(window.location.href as string) === 'https://google.com'`);

fs.writeFileSync(p, code);
