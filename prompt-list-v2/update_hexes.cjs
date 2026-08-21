const fs = require('fs');

const cssPath = 'src/components/PromptCard.module.css';
let css = fs.readFileSync(cssPath, 'utf8');
css = css.replace(/#1E50FF/g, '#1754D8');
fs.writeFileSync(cssPath, css);

const pagePath = 'src/pages/UnlockAdPage.tsx';
let page = fs.readFileSync(pagePath, 'utf8');
page = page.replace(/#1E50FF/g, '#1754D8');
fs.writeFileSync(pagePath, page);

console.log('updated css and page hex');
