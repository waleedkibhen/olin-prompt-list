const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = "import { AdsterraSocialBar } from './AdsterraSocialBar';\n" + code;

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Added import');
