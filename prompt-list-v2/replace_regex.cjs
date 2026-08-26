const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?1500\);\r?\n  \};/;

const replacement = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Dynamically inject the Monetag Vignette Script
    const script = document.createElement('script');
    script.dataset.zone = '11641986';
    script.src = 'https://n6wxm.com/vignette.min.js';
    document.body.appendChild(script);

    // Bypass the clunky blue spinner and instantly unlock the card,
    // but reset adDelayComplete so the fluid 1.5s skeleton loading animation plays
    // behind the Vignette overlay while the ad initializes and the user watches it.
    setIsUnlocked(true);
    setAdDelayComplete(false);

    setTimeout(() => {
      setAdDelayComplete(true);
      
      try {
        const unlockedRaw = localStorage.getItem('unlockedPrompts');
        const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
        if (!unlocked.includes(post.id)) {
          unlocked.push(post.id);
          localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
        }
      } catch (e) {}
    }, 1500);
  };`;

const newCode = code.replace(regex, replacement);

if (newCode === code) {
  console.log("NO MATCH FOUND!");
} else {
  fs.writeFileSync('src/components/PromptCard.tsx', newCode);
  console.log("Successfully replaced with regex.");
}
