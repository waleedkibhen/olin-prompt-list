const fs = require('fs');
const cssPath = 'src/components/PromptCard.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
  /border: 2px solid #0572F6;\s*border-radius: 4px;/,
  "border: 2.5px solid #0572F6;\n    border-radius: 6px;"
);
fs.writeFileSync(cssPath, css);
console.log('updated css');
