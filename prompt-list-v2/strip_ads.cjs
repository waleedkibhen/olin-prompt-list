const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Remove adDelayComplete logic
code = code.replace(/const \[adDelayComplete, setAdDelayComplete\] = useState<boolean>\(!isAdSupported\);[\s\S]*?\}, \[isAdSupported, isModalOpen, isUnlocked\]\);/, "");
code = code.replace(/useEffect\(\(\) => \{\r?\n\s*if \(isAdSupported\) \{[\s\S]*?\}, \[isAdSupported, isModalOpen\]\);/, "");

// 2. Remove handleWatchAdToUnlock
code = code.replace(/const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?setTimeout\(\(\) => setAdDelayComplete\(true\), 1500\);\r?\n\s*\}/, "");

// 3. Make ad_supported posts unlocked by default
// Fix initial state:
const initRegex = /const \[isUnlocked, setIsUnlocked\] = useState<boolean>\(\(\) => \{[\s\S]*?return isFree \|\| isOwner \|\| localUnlocked;\r?\n\s*\}\);/;
const initReplacement = `const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const isFree = !ENABLE_MONETIZATION ? true : (effectiveMonetization === 'free' || effectiveMonetization === 'ad_supported');
    const isOwner = Boolean(user && post.creator?.uid === user.uid);
    const storageKey = user ? \`unlocked_\${user.uid}\` : 'unlocked_guest';
    let localUnlocked = false;
    try {
      const arr = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localUnlocked = arr.includes(post.id);
    } catch(e){}
    return isFree || isOwner || localUnlocked;
  });`;
code = code.replace(initRegex, initReplacement);

// Fix useEffect state:
code = code.replace(/const isFree = effectiveMonetization === 'free';/, "const isFree = effectiveMonetization === 'free' || effectiveMonetization === 'ad_supported';");

// 4. Remove the locked button UI from the render block
const renderRegex = /\{isAdSupported && !isUnlocked \? \([\s\S]*?\) : isAdSupported && !adDelayComplete \? \([\s\S]*?\) : \(/;
code = code.replace(renderRegex, "( ");

// Also replace the closing brace of that ternary if it exists right before the promptTextContainer...
// Actually, let's just make it simpler by matching the whole skeleton/ad block:
// Wait, my regex replaced it with "( " but it was a ternary. Let's do it safely.
fs.writeFileSync('src/components/PromptCard.tsx.temp', code);
console.log("Stage 1 done");
