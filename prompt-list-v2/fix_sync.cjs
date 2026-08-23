const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// Fix handlePaymentSuccess to use correct local storage key
const targetSuccess = `      try {
        const unlockedRaw = localStorage.getItem('unlockedPrompts');
        const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
        if (!unlocked.includes(post.id)) {
          unlocked.push(post.id);
          localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
        }`;
const replaceSuccess = `      try {
        const storageKey = user ? \`unlocked_\${user.uid}\` : 'unlocked_guest';
        const unlockedRaw = localStorage.getItem(storageKey);
        const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
        if (!unlocked.includes(post.id)) {
          unlocked.push(post.id);
          localStorage.setItem(storageKey, JSON.stringify(unlocked));
        }`;
code = code.replace(targetSuccess, replaceSuccess);

// Fix watch ad local storage too
const targetAd = `        try {
          const unlockedRaw = localStorage.getItem('unlockedPrompts');
          const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
          if (!unlocked.includes(post.id)) {
            unlocked.push(post.id);
            localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
          }
        } catch (e) {}`;
const replaceAd = `        try {
          const storageKey = user ? \`unlocked_\${user.uid}\` : 'unlocked_guest';
          const unlockedRaw = localStorage.getItem(storageKey);
          const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
          if (!unlocked.includes(post.id)) {
            unlocked.push(post.id);
            localStorage.setItem(storageKey, JSON.stringify(unlocked));
          }
        } catch (e) {}`;
code = code.replace(targetAd, replaceAd);

// Fix useEffect to check server purchasedPrompts
const targetEffect = `    setIsUnlocked(isFree || isOwner || subUnlocked || unlockedArr.includes(post.id));`;
const replaceEffect = `    let serverUnlocked = false;
    if (user && profile && profile.purchasedPrompts && profile.purchasedPrompts.includes(post.id)) {
      serverUnlocked = true;
      if (!unlockedArr.includes(post.id)) {
        unlockedArr.push(post.id);
        localStorage.setItem(storageKey, JSON.stringify(unlockedArr));
      }
    }
    
    setIsUnlocked(isFree || isOwner || subUnlocked || unlockedArr.includes(post.id) || serverUnlocked);`;
code = code.replace(targetEffect, replaceEffect);

fs.writeFileSync(p, code);
console.log('fixed promptcard sync issues');
