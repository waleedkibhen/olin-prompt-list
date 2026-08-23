const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const t = `  const handlePaymentSuccess = async () => {
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

const r = `  const handlePaymentSuccess = async () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const storageKey = user ? \`unlocked_\${user.uid}\` : 'unlocked_guest';
      const unlockedRaw = localStorage.getItem(storageKey);
      const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem(storageKey, JSON.stringify(unlocked));
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

code = code.replace(t, r);
fs.writeFileSync(p, code);
console.log('fixed handlePaymentSuccess manually');
