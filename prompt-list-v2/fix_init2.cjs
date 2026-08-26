const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const \[isUnlocked, setIsUnlocked\] = useState\(false\);/;

const replacement = `const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const isFree = !ENABLE_MONETIZATION ? true : ((post.monetizationType as any) === 'ad' ? false : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free'))) === 'free';
    const isOwner = Boolean(user && post.creator?.uid === user.uid);
    const storageKey = user ? \`unlocked_\${user.uid}\` : 'unlocked_guest';
    let localUnlocked = false;
    try {
      const arr = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localUnlocked = arr.includes(post.id);
    } catch(e){}
    return isFree || isOwner || localUnlocked;
  });`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed isUnlocked initial state!");
