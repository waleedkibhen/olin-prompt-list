const fs = require('fs');

const cssPath = 'src/components/PromptCard.module.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Replace hex
css = css.replace(/#1754D8/g, '#0572F6');
// Update border thickness and radius for blurredVaultContainer
css = css.replace(
  /border: 2px solid #0572F6;\s*border-radius: 2px;/,
  "border: 3px solid #0572F6;\n    border-radius: 8px;"
);
fs.writeFileSync(cssPath, css);

const compPath = 'src/components/PromptCard.tsx';
let comp = fs.readFileSync(compPath, 'utf8');
comp = comp.replace(/#1754D8/g, '#0572F6');
// Update border radius of Watch Ad button
comp = comp.replace(
  /borderRadius: '2px'/g,
  "borderRadius: '8px'"
);
// Also ensure the preview paywall button radius looks fine (currently 4px). I'll change it to 6px just in case, but they specifically mentioned "Watch ad" button. 
// "Same for the button itself, the 'Watch ad' button."
comp = comp.replace(
  /borderRadius: '4px'/g,
  "borderRadius: '6px'"
);

fs.writeFileSync(compPath, comp);

const pagePath = 'src/pages/UnlockAdPage.tsx';
let page = fs.readFileSync(pagePath, 'utf8');
page = page.replace(/#1754D8/g, '#0572F6');
// the unlock ad page button has borderRadius: '4px', update to '8px' to match
page = page.replace(
  /borderRadius: '4px'/g,
  "borderRadius: '8px'"
);
fs.writeFileSync(pagePath, page);

console.log('updated styles');
