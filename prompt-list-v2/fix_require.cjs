const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(/const \{ setDoc \} = require\('firebase\/firestore'\);\n\s*/g, '');

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed require in PromptCard.tsx");
