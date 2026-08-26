const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
code = code.replace(/import \{ AdsterraSocialBar \} from '\.\/AdsterraSocialBar';\r?\n/, '');
code = code.replace(/\{effectiveMonetization === 'ad_supported' && <AdsterraSocialBar \/>\}\r?\n\s*/, '');
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Removed AdsterraSocialBar from PromptCard.tsx");
