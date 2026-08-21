const fs = require('fs');
const path = require('path');

const cssPath = path.join('src', 'components', 'PromptCard.module.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

// The blurredVaultContainer currently has the green border. We will keep it.
// Wait, the inner div has the border. 
// Let's remove the border from blurredVaultContainer and only keep it on the inner box? Or vice versa?
// In the user's first screenshot from the earlier message, there was NO outer border initially. 
// Oh wait, yes there was. I'll just remove the border from the inner div.
