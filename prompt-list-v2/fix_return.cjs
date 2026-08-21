const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
    "return (\n    <>) => window.removeEventListener('popstate', handlePopState);",
    "return () => window.removeEventListener('popstate', handlePopState);"
);

fs.writeFileSync(p, code);
console.log('fixed return');
