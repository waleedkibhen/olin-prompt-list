const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Replace the mobile view skeleton block
const regex = /isAdSupported && !adDelayComplete \? \(\r?\n\s*<div className=\{styles\.skeletonBox\} style=\{\{ height: "120px" \}\} \/>\r?\n\s*\) : \(/;
code = code.replace(regex, "(");
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Removed mobile skeleton block");
