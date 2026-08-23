const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const unlockedRaw = localStorage.getItem('unlockedPrompts');
      const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
      }
    } catch (e) {}
  };`;

const replace = `  const handlePaymentSuccess = async () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const unlockedRaw = localStorage.getItem('unlockedPrompts');
      const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
      }
      
      if (user && post.whopPlanId) {
        await fetch('/api/whop/verify-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkoutId: post.whopPlanId,
            userId: user.uid,
            promptId: post.id
          })
        });
      }
    } catch (e) {}
  };`;

code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('fixed payment success handler');
