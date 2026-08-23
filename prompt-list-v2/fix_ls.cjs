const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(/localStorage\.getItem\('unlockedPrompts'\)/g, "localStorage.getItem(user ? `unlocked_${user.uid}` : 'unlocked_guest')");
code = code.replace(/localStorage\.setItem\('unlockedPrompts'/g, "localStorage.setItem(user ? `unlocked_${user.uid}` : 'unlocked_guest'");

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed local storage');
