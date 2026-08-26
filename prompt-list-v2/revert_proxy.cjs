const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Revert isProtected so ad_supported is NOT included
code = code.replace(/const isProtected = Boolean\(\(effectiveMonetization === 'charge' \|\| effectiveMonetization === 'subscribers_only' \|\| effectiveMonetization === 'ad_supported'\)/, 
"const isProtected = Boolean((effectiveMonetization === 'charge' || effectiveMonetization === 'subscribers_only')");

// 2. Remove the broken proxy injection
const injectRegex = /\/\/ Inject Monetag script when the modal opens for ad-supported posts[\s\S]*?\}, \[isAdSupported, isModalOpen, isUnlocked\]\);/;
code = code.replace(injectRegex, "");

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Reverted proxy and vault for ads");
