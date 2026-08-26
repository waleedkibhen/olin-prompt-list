const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const target = `  const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // IDEAL SOLUTION: DIRECT LINK
    // Replace this URL with your Adsterra Direct Link URL
    const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/k1qybg57?key=41b37323a01727c9cc93104afa6c1671';
    
    if (DIRECT_LINK_URL && (DIRECT_LINK_URL as string) !== 'https://google.com') {
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

const replacement = `  const handleWatchAdToUnlock = (e: React.MouseEvent) => {
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

code = code.replace(target, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Successfully replaced handleWatchAdToUnlock");
