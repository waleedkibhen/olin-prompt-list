const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

const regex = /const postPayload = \{[\s\S]*?prompts: prompts,/m;
const match = code.match(regex);
if (match) {
  const replace = `const isCharge = monetizationType === 'paid' && paidUnlockMethod === 'charge';\n      ` + match[0].replace('promptText: prompts[0],', 'promptText: isCharge ? "" : prompts[0],').replace('prompts: prompts,', 'prompts: isCharge ? [] : prompts,');
  code = code.replace(match[0], replace);
  fs.writeFileSync(p, code);
  console.log('fixed create post payload regex');
} else {
  console.log('regex not matched');
}
