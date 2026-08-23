const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regexToReplace = /    const handlePaymentSuccess = \(\) => \{\s*setShowCheckout\(false\);\s*setIsUnlocked\(true\);\s*\/\/ Ephemeral unlock: do not persist to localStorage\s*\}, 1500\);\s*\};/;

const correctFunctions = `    const handlePaymentSuccess = () => {
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
      
      const DIRECT_LINK_URL = 'https://www.effectivecpmnetwork.com/k1qybg57?key=41b37323a01727c9cc93104afa6c1671';
      
      if (DIRECT_LINK_URL && (DIRECT_LINK_URL as string) !== 'https://google.com') {
          window.open(DIRECT_LINK_URL, '_blank');
      } else {
          alert("Developer Note: Please provide your Adsterra Direct Link URL to instantly open the ad.");
      }

      setIsWatchingAd(true);
      setTimeout(() => {
        setIsWatchingAd(false);
        setIsUnlocked(true);
        // Ephemeral unlock for ads: do not persist to localStorage
      }, 1500);
    };`;

code = code.replace(regexToReplace, correctFunctions);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Restored handlePaymentSuccess and handleWatchAdToUnlock');
