const fs = require('fs');
let lines = fs.readFileSync('src/components/PromptCard.tsx', 'utf8').split('\n');

const correctCode = `  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const unlockedRaw = localStorage.getItem(user ? \`unlocked_\${user.uid}\` : 'unlocked_guest');
      const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem(user ? \`unlocked_\${user.uid}\` : 'unlocked_guest', JSON.stringify(unlocked));
      }
    } catch (e) {}
  };

  const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // IDEAL SOLUTION: DIRECT LINK
    const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/k1qybg57?key=41b37323a01727c9cc93104afa6c1671';
    
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
      // Ephemeral unlock: do not persist to localStorage
    }, 1500);
  };`;

// Find where handlePaymentSuccess starts
let startIndex = -1;
let endIndex = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('const handlePaymentSuccess = () => {')) {
        startIndex = i;
    }
    if (startIndex !== -1 && lines[i].includes('const handleSubscribeToUnlock =')) {
        endIndex = i;
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    lines.splice(startIndex, endIndex - startIndex, correctCode);
    fs.writeFileSync('src/components/PromptCard.tsx', lines.join('\n'));
    console.log('Fixed exactly!');
} else {
    console.log('Could not find bounds');
}
