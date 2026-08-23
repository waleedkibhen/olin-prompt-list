const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatePostPage.tsx', 'utf8');
const matches = code.match(/monetizationType[^\n]+/g);
console.log('CreatePostPage monetization matches:', matches);
