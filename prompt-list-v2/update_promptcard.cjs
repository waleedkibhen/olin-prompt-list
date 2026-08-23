const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Import Adsterra
if (!code.includes('AdsterraSocialBar')) {
    code = code.replace(
        /import React, \{ useState, useEffect \} from 'react';/g,
        "import React, { useState, useEffect } from 'react';\nimport { AdsterraSocialBar } from './AdsterraSocialBar';"
    );
}

// 2. Change isProtected definition
code = code.replace(
    /const isProtected = Boolean\(effectiveMonetization !== 'free' && \(\!isUnlocked \|\| \(isCreator && previewPaywall\)\)\);/g,
    "const isProtected = Boolean((effectiveMonetization === 'charge' || effectiveMonetization === 'subscribers_only') && (!isUnlocked || (isCreator && previewPaywall)));"
);

// 3. Inject AdsterraSocialBar inside the unmasked prompt area (e.g. right before generation details)
code = code.replace(
    /<div className=\{styles\.mobileGenDetails\} style=\{\{ marginBottom: '1\.5rem', marginTop: '1\.5rem' \}\}>/g,
    "{effectiveMonetization === 'ad_supported' && <AdsterraSocialBar />}\n              <div className={styles.mobileGenDetails} style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Updated PromptCard.tsx');
