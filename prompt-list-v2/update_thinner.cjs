const fs = require('fs');

const cssPath = 'src/components/PromptCard.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

// The vault outline is currently:
// border: 3px solid #0572F6;
// border-radius: 8px;
css = css.replace(
  /border: 3px solid #0572F6;\s*border-radius: 8px;/,
  "border: 2px solid #0572F6;\n    border-radius: 4px;"
);
fs.writeFileSync(cssPath, css);

console.log('updated css');
