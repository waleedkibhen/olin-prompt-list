const fs = require('fs');
const p = 'C:/Users/ACER/.gemini/antigravity/brain/ee7b1da3-3645-4699-8777-9ef747901d26/task.md';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(/- `\[ \]` \*\*Step A/g, "- `[x]` **Step A");
code = code.replace(/- `\[ \]` \*\*Step B/g, "- `[x]` **Step B");
code = code.replace(/- `\[ \]` \*\*Step C/g, "- `[x]` **Step C");
code = code.replace(/- `\[ \]` \*\*Step D/g, "- `[x]` **Step D");

fs.writeFileSync(p, code);
console.log('updated tasks');
