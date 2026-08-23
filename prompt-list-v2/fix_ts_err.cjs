const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
    /                 \) : \(\s*\{effectiveMonetization === 'ad_supported' && \!adDelayComplete \? \(/g,
    "                 ) : (\n                  <>\n                    {effectiveMonetization === 'ad_supported' && !adDelayComplete ? ("
);

code = code.replace(
    /                     \)\}\s*\)\}/g,
    "                     )}\n                  </>\n                )}"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed TS Error');
