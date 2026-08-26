const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Remove from old location
const regex = /\s*const effectiveMonetization = !ENABLE_MONETIZATION \? 'free' : \(\(post\.monetizationType as any\) === 'ad' \? 'ad_supported' : \(post\.monetizationType \|\| \(post\.isPaid \? 'subscribers_only' : 'free'\)\)\);\r?\n\s*const isAdSupported = Boolean\(effectiveMonetization === 'ad_supported' \|\| \(post\.monetizationType as any\) === 'ad_supported' \|\| \(post\.monetizationType as any\) === 'ad'\);\r?\n/;
code = code.replace(regex, "\n");

// Insert before isUnlocked
const insertRegex = /const \[isUnlocked, setIsUnlocked\] = useState/;
const insertReplacement = `const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : ((post.monetizationType as any) === 'ad' ? 'ad_supported' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free')));
  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || (post.monetizationType as any) === 'ad_supported' || (post.monetizationType as any) === 'ad');
  
  const [isUnlocked, setIsUnlocked] = useState`;
code = code.replace(insertRegex, insertReplacement);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Moved effectiveMonetization to top");
