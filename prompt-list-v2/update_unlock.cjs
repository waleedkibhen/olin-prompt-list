const fs = require('fs');
const p = 'src/pages/UnlockAdPage.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /This creator has chosen to monetize their prompt via ads\. Click the button below to view a quick sponsor message and reveal the generative parameters\./,
  "The creator has chosen to monetize their prompts through ads, and click the button below to view a quick sponsor message or click the button below to watch an ad to reveal the prompt."
);

code = code.replace(
  /<PlayCircle size=\{22\} \/>\s*Show Ad & Unlock/,
  "Watch Ad"
);

fs.writeFileSync(p, code);
console.log("Updated UnlockAdPage");
