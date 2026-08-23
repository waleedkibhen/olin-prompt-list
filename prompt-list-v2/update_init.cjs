const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `setIsUnlocked(isFree || isOwner || subUnlocked || unlockedArr.includes(post.id) || serverUnlocked);`;
const replacement = `setIsUnlocked(isFree || isOwner || subUnlocked || (effectiveMonetization !== 'ad_supported' && unlockedArr.includes(post.id)) || serverUnlocked);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed initialization logic');
