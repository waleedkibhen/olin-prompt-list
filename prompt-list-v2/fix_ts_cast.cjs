const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
  `  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post.monetizationType === 'ad' ? 'ad_supported' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free')));
  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || post.monetizationType === 'ad_supported' || post.monetizationType === 'ad');`,
  `  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : ((post.monetizationType as any) === 'ad' ? 'ad_supported' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free')));
  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || (post.monetizationType as any) === 'ad_supported' || (post.monetizationType as any) === 'ad');`
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed TS cast');
