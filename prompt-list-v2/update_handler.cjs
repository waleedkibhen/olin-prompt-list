const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// Update the handleWatchAdToUnlock function
const oldFunc = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(\`/unlock/\${post.id}\`);
  };`;

const newFunc = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Open the ad script in a new tab
    window.open('/ad-sponsor.html', '_blank');
    
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

code = code.replace(oldFunc, newFunc);

// Update the isWatchingAd UI from green to blue (#0572F6)
code = code.replace(/border: '2px dashed #10b981'/g, "border: '2px dashed #0572F6'");
code = code.replace(/color: '#10b981'/g, "color: '#0572F6'");

fs.writeFileSync(p, code);
console.log('updated PromptCard for instant unlock');
