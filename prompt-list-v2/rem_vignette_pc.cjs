const fs = require('fs');
const code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ Universal Ad Injection for ALL posts[\s\S]*?}, \[isModalOpen\]\);\r?\n/g;

if (code.match(regex)) {
    const newCode = code.replace(regex, "");
    fs.writeFileSync('src/components/PromptCard.tsx', newCode);
    console.log("Removed Vignette injection from PromptCard.");
} else {
    console.log("Could not find Vignette injection in PromptCard.");
}
