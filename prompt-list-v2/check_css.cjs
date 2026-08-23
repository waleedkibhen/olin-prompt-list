const fs = require('fs');
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');
console.log('Has pulse/skeleton in CSS?', css.includes('skeleton') || css.includes('shimmer') || css.includes('pulse'));
