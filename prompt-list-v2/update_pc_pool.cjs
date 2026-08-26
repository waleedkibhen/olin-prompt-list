const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ Increment global Ad Pool views if this is an ad-supported prompt!\r?\n\s*if \(isAdSupported \|\| \(post\.monetizationType as any\) === 'ad'\) \{\r?\n\s*try \{\r?\n\s*const poolRef = doc\(db, 'system', 'adPool'\);\r?\n\s*await updateDoc\(poolRef, \{ totalPlatformAdViews: increment\(1\) \}\);\r?\n\s*\} catch\(e\) \{\r?\n\s*\/\/ Ignore if document doesn't exist yet, admin creates it\r?\n\s*\}\r?\n\s*\}/;

const replacement = `// Increment global Ad Pool views since ads now run on EVERY post!
            try {
              const poolRef = doc(db, 'system', 'adPool');
              await updateDoc(poolRef, { totalPlatformAdViews: increment(1) });
            } catch(e) {
              // Ignore if document doesn't exist yet
            }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated PromptCard global ad view incrementing");
