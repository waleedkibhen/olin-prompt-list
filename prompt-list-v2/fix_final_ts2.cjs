const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
    /import \{ WhopCheckoutModal \} from '\.\/WhopCheckoutModal';/g,
    "import WhopCheckoutModal from './WhopCheckoutModal';"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed export type');
