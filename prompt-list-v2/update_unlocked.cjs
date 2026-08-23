const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
    /setIsUnlocked\(isFree \|\| isOwner \|\| subUnlocked \|\| \(effectiveMonetization !== 'ad_supported' && unlockedArr\.includes\(post\.id\)\) \|\| serverUnlocked\);/g,
    "setIsUnlocked(isFree || effectiveMonetization === 'ad_supported' || isOwner || subUnlocked || unlockedArr.includes(post.id) || serverUnlocked);"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Updated isUnlocked logic');
