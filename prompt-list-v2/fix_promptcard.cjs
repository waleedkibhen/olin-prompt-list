const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `const incrementView = async () => {
      try {
        if (!hasViewedRecently(post.id)) {
          const postRef = doc(db, 'posts', post.id);
          await updateDoc(postRef, { viewsCount: increment(1) });
          recordView(post.id);
        }
      } catch (err) {
        console.error("Failed to increment view count:", err);
      }
    };`;

const replacement = `const incrementView = async () => {
      try {
        if (!hasViewedRecently(post.id)) {
          const postRef = doc(db, 'posts', post.id);
          await updateDoc(postRef, { viewsCount: increment(1) });
          
          if (isAdSupported) {
            const statsRef = doc(db, 'system', 'adPool');
            await setDoc(statsRef, { totalPlatformAdViews: increment(1) }, { merge: true }).catch(e => console.error("Failed to update global ad stats", e));
          }

          recordView(post.id);
        }
      } catch (err) {
        console.error("Failed to increment view count:", err);
      }
    };`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed PromptCard.tsx");
