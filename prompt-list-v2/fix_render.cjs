const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx.temp', 'utf8');

// Fix the syntax error from the previous replacement
code = code.replace(/\( \r?\n\s*<>/, '<>');

// Remove the dead handleWatchAdToUnlock button in the vault
const deadButtonRegex = /\) : \(\r?\n\s*<button\r?\n\s*onClick=\{handleWatchAdToUnlock\}[\s\S]*?<\/button>\r?\n\s*\)/;
code = code.replace(deadButtonRegex, "");

// Also remove handleWatchAdToUnlock from import or function definition if any remains
code = code.replace(/const handleWatchAdToUnlock =[\s\S]*?setTimeout\(\(\) => setAdDelayComplete\(true\), 1500\);\r?\n\s*\}\r?\n/, '');

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed render block and dead code");
