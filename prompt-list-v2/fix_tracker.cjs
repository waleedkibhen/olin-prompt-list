const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const incrementView = async \(\) => \{\r?\n\s*try \{\r?\n\s*if \(!hasViewedRecently\(post\.id\)\) \{\r?\n\s*const postRef = doc\(db, 'posts', post\.id\);\r?\n\s*await updateDoc\(postRef, \{ viewsCount: increment\(1\) \}\);\r?\n\s*recordView\(post\.id\);\r?\n\s*\}\r?\n\s*\} catch \(err\) \{/;

const replacement = `const incrementView = async () => {
        try {
          if (!hasViewedRecently(post.id)) {
            const postRef = doc(db, 'posts', post.id);
            await updateDoc(postRef, { viewsCount: increment(1) });
            
            // Increment global Ad Pool views if this is an ad-supported prompt!
            if (isAdSupported || (post.monetizationType as any) === 'ad') {
              try {
                const poolRef = doc(db, 'system', 'adPool');
                await updateDoc(poolRef, { totalPlatformAdViews: increment(1) });
              } catch(e) {
                // Ignore if document doesn't exist yet, admin creates it
              }
            }
            
            recordView(post.id);
          }
        } catch (err) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Restored totalPlatformAdViews tracker");
