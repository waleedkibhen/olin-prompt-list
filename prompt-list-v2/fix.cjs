const fs = require('fs');
const path = require('path');
const p = path.join('src', 'components', 'PromptCard.module.css');
let css = fs.readFileSync(p, 'utf8');

css = css.replace(
  /\\.creatorShareTitle \\{\\n  font-size: 0\\.85rem;\\n  font-weight: 400;\\n  color: var\\(--text-muted\\);/g,
  '.creatorShareTitle {\\n  font-size: 0.85rem;\\n  font-weight: 400;\\n  color: var(--text-primary);'
);

fs.writeFileSync(p, css);
console.log('done');

