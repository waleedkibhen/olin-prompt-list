const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ Increment global Ad Pool views since ads now run on EVERY post!\r?\n\s*try \{\r?\n\s*const poolRef = doc\(db, 'system', 'adPool'\);\r?\n\s*await updateDoc\(poolRef, \{ totalPlatformAdViews: increment\(1\) \}\);\r?\n\s*\} catch\(e\) \{\r?\n\s*\/\/ Ignore if document doesn't exist yet\r?\n\s*\}/;

const replacement = `// Increment global Ad Pool views since ads now run on EVERY post!
            try {
              const poolRef = doc(db, 'system', 'adPool');
              await updateDoc(poolRef, { totalPlatformAdViews: increment(1) });
            } catch(e) {}
            
            // Also keep a running tally on the creator's user document to save reads on the dashboard
            try {
              if (post.creator?.uid) {
                const userRef = doc(db, 'users', post.creator.uid);
                await updateDoc(userRef, { totalViews: increment(1) });
              }
            } catch(e) {}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated PromptCard to track totalViews on user doc");
