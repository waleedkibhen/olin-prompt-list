const fs = require('fs');
const path = require('path');
const cssPath = path.join('src', 'components', 'PromptCard.module.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(
  /\.modalActionBar \{\s*order:\s*4;\s*padding:\s*1rem;\s*\}/g,
  '.modalActionBar { order: 4; padding: 0 1rem !important; margin: 1rem 1rem 0.5rem 1rem !important; flex-wrap: nowrap !important; overflow-x: auto; gap: 1rem !important; }'
);

fs.writeFileSync(cssPath, css);
console.log('Done');
