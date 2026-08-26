const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /scriptEl = document\.createElement\('script'\);\r?\n\s*scriptEl\.id = 'monetag-vignette';\r?\n\s*scriptEl\.dataset\.zone = '11641986';\r?\n\s*scriptEl\.src = 'https:\/\/n6wxm\.com\/vignette\.min\.js';\r?\n\s*document\.head\.appendChild\(scriptEl\);/;

const replacement = `// Use exact IIFE structure requested by Monetag to ensure it triggers
        (function(s){
          s.id = 'monetag-vignette';
          s.dataset.zone = '11641986';
          s.src = 'https://n6wxm.com/vignette.min.js';
        })([document.documentElement, document.body].filter(Boolean).pop()!.appendChild(document.createElement('script')));`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated to exact IIFE");
