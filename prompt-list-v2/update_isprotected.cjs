const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /const isProtected = Boolean\(effectiveMonetization !== 'free' && !isUnlocked && !isCreator\);/,
  "const isProtected = Boolean(effectiveMonetization !== 'free' && !isUnlocked);"
);
fs.writeFileSync(p, code);
