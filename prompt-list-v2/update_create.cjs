const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatePostPage.tsx', 'utf8');

// Replace the unlock method UI
const regex = /<label style=\{\{ marginBottom: '1rem', display: 'block' \}\}>Unlock Method<\/label>[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n/;
code = code.replace(regex, "");

// Replace the monetization type state init to default paidUnlockMethod to 'charge'
code = code.replace(/const \[paidUnlockMethod, setPaidUnlockMethod\] = useState<'charge'\|'ad'>\('ad'\);/, "const [paidUnlockMethod, setPaidUnlockMethod] = useState<'charge'>('charge');");

fs.writeFileSync('src/pages/CreatePostPage.tsx', code);
console.log("CreatePostPage updated");
