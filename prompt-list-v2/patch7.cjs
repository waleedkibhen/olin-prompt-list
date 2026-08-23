const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// The WhopCheckoutModal declaration didn't work because it was probably replaced somewhere else or I didn't match the import
code = `declare const WhopCheckoutModal: any;\n` + code;

// Move isUnlocked declaration up
const isUnlockedDecl = `  const [isUnlocked, setIsUnlocked] = useState(false);\n`;
code = code.replace(isUnlockedDecl, '');

const target = `  const [securePromptData, setSecurePromptData] = useState<{promptText?: string, prompts?: string[]} | null>(null);`;
code = code.replace(target, isUnlockedDecl + target);

fs.writeFileSync(p, code);
console.log('moved isUnlocked');
