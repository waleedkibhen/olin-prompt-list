const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// I need to change window.open('/ad-sponsor.html', '_blank') back to just directly triggering the ad URL.
// They said "I just want to be redirected to the URL of this specific advertisement, correct?"
// Let's redirect them to the ad network directly instead of /ad-sponsor.html
// Wait, the ad network gave a JS script `<script src="https://pl30941411.effectivecpmnetwork.com/d0/cd/78/d0cd78e0f7daecfe6effe9409b414efc.js"></script>`
// If they want to just click "Watch Ad" and see the ad directly, there are two ways:
// 1. We redirect them directly to the direct link of the ad network if they have one (they only gave a script)
// 2. We inject the script into the current page dynamically exactly when they click, and let the ad network do its popunder.

const oldFuncRegex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?\}, 1500\);\s*\};/;

const newFunc = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Inject the ad script directly into the page so it triggers on their click/next click
    const script = document.createElement('script');
    script.src = '//pl30941411.effectivecpmnetwork.com/d0/cd/78/d0cd78e0f7daecfe6effe9409b414efc.js';
    script.type = 'text/javascript';
    document.head.appendChild(script);
    
    // Also simulate a click on the body just in case the popunder requires an immediate interaction event
    setTimeout(() => {
        document.body.click();
    }, 100);

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

code = code.replace(oldFuncRegex, newFunc);

fs.writeFileSync(p, code);
console.log('updated handler to inject script directly');
