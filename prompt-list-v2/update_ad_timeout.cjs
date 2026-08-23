const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /setIsUnlocked\(true\);\s*try\s*\{\s*const unlockedRaw\s*=\s*localStorage\.getItem[^]*?catch\s*\([^\)]*\)\s*\{\}\s*\}, 1500\);/m;

const replacement = `setIsUnlocked(true);
        // Ephemeral unlock: do not persist to localStorage
      }, 1500);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Done replacement');
