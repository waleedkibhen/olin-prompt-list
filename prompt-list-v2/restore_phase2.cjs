const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = "import { AdsterraSocialBar } from './AdsterraSocialBar';\n" + code;

code = code.replace(
    /const isProtected = Boolean\(effectiveMonetization !== 'free' && \(\!isUnlocked \|\| \(isCreator && previewPaywall\)\)\);/g,
    "const isProtected = Boolean((effectiveMonetization === 'charge' || effectiveMonetization === 'subscribers_only') && (!isUnlocked || (isCreator && previewPaywall)));"
);

code = code.replace(
    /setIsUnlocked\(isFree \|\| isOwner \|\| subUnlocked \|\| \(effectiveMonetization !== 'ad_supported' && unlockedArr\.includes\(post\.id\)\) \|\| serverUnlocked\);/g,
    "setIsUnlocked(isFree || effectiveMonetization === 'ad_supported' || isOwner || subUnlocked || unlockedArr.includes(post.id) || serverUnlocked);"
);

code = code.replace(
    /<div className=\{styles\.mobileGenDetails\} style=\{\{ marginBottom: '1\.5rem', marginTop: '1\.5rem' \}\}>/g,
    "{effectiveMonetization === 'ad_supported' && <AdsterraSocialBar />}\n              <div className={styles.mobileGenDetails} style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Restored Phase 2');
