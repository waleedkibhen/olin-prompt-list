const fs = require('fs');
const path = require('path');
const cssPath = path.join('src', 'components', 'PromptCard.module.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
  /\.barBtn \{/,
  '.barBtn {\n  flex-shrink: 0;'
);

fs.writeFileSync(cssPath, css);
console.log('Done');
