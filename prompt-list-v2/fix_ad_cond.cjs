const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
code = code.replace(
  `{effectiveMonetization === 'ad_supported' && <AdsterraSocialBar />}`,
  `{isAdSupported && <AdsterraSocialBar />}`
);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed Adsterra condition');
