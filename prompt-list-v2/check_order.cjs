const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const isUnlockedIdx = lines.findIndex(l => l.includes('const [isUnlocked, setIsUnlocked] = useState'));
const effMonIdx = lines.findIndex(l => l.includes('const effectiveMonetization ='));
console.log(`isUnlocked is at line ${isUnlockedIdx}`);
console.log(`effectiveMonetization is at line ${effMonIdx}`);
