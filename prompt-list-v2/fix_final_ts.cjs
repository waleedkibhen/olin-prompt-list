const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

if (!code.includes('import { WhopCheckoutModal }')) {
    code = "import { WhopCheckoutModal } from './WhopCheckoutModal';\n" + code;
}

code = code.replace(
    /if \(DIRECT_LINK_URL && DIRECT_LINK_URL !== 'https:\/\/google\.com'\) \{/g,
    "if (DIRECT_LINK_URL && (DIRECT_LINK_URL as string) !== 'https://google.com') {"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed WhopCheckoutModal and TS error');
