const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const regex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?\}, 1500\);\s*\};/;

const cleanFunc = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // IDEAL SOLUTION: DIRECT LINK
    // Replace this URL with your Adsterra Direct Link URL
    const DIRECT_LINK_URL = 'https://google.com'; // PLACEHOLDER
    
    if (DIRECT_LINK_URL && DIRECT_LINK_URL !== 'https://google.com') {
        window.open(DIRECT_LINK_URL, '_blank');
    } else {
        alert("Developer Note: Please provide your Adsterra Direct Link URL to instantly open the ad.");
    }

    // Show unlocking state
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      setIsUnlocked(true);
      
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

code = code.replace(regex, cleanFunc);
fs.writeFileSync(p, code);
console.log('Cleaned up handler for direct link');
