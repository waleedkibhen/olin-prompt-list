const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const script = document\.createElement\('script'\);\r?\n\s*script\.dataset\.zone = '11641986';\r?\n\s*script\.src = 'https:\/\/n6wxm\.com\/vignette\.min\.js';\r?\n\s*document\.body\.appendChild\(script\);/;

const replacement = `// Dynamically inject the exact Monetag Vignette Script provided
    (function(s){
      s.dataset.zone='11641986';
      s.src='https://n6wxm.com/vignette.min.js';
    })([document.documentElement, document.body].filter(Boolean).pop()!.appendChild(document.createElement('script')));`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated script injection to use exact IIFE");
