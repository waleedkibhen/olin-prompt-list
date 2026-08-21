const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace("setIsSubmitting(false);", "setIsScanning(false);");

fs.writeFileSync(p, code);
console.log('fixed frontend crash');
