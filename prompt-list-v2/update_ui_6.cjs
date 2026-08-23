const fs = require('fs');

// 1. Update CSS
let css = fs.readFileSync('src/components/PromptCard.module.css', 'utf8');
css = css.replace(/border: 2\.5px solid #0572F6;/g, 'border: none;');
fs.writeFileSync('src/components/PromptCard.module.css', css);
console.log('CSS updated');

// 2. Update TSX
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
code = code.replace(
  /<span style=\{\{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0\.5rem' \}\}><Lock size=\{18\} \/> Premium Prompt<\/span>/g,
  "'Premium Prompt'"
);

code = code.replace(
  /backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0px'/g,
  "backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px'"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('TSX updated');
