const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const isProtected = Boolean\(\(effectiveMonetization === 'charge' \|\| effectiveMonetization === 'subscribers_only'\) && \(!isUnlocked \|\| \(isCreator && previewPaywall\)\)\);/;

const replacement = `const isProtected = Boolean((effectiveMonetization === 'charge' || effectiveMonetization === 'subscribers_only' || effectiveMonetization === 'ad_supported') && (!isUnlocked || (isCreator && previewPaywall)));`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated isProtected to include ad_supported");
