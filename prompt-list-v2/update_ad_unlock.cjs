const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `      setTimeout(() => {
        setIsWatchingAd(false);
        setIsUnlocked(true);
        
        try {
          const unlockedRaw = localStorage.getItem(user ? \`unlocked_\${user.uid}\` : 'unlocked_guest');
          const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
          if (!unlocked.includes(post.id)) {
            unlocked.push(post.id);
            localStorage.setItem(user ? \`unlocked_\${user.uid}\` : 'unlocked_guest', JSON.stringify(unlocked));
          }
        } catch (e) {}
      }, 5000);`;

const replacement = `      setTimeout(() => {
        setIsWatchingAd(false);
        setIsUnlocked(true);
        // Note: For ad-supported prompts, we deliberately do NOT save to localStorage
        // so that the unlock is ephemeral (temporary until page refresh).
      }, 5000);`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Ad unlock made ephemeral');
