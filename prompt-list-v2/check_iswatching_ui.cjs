const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const uiIdx = lines.findIndex(l => l.includes('isWatchingAd ?'));
if(uiIdx !== -1) {
  console.log(lines.slice(uiIdx - 5, uiIdx + 15).join('\n'));
} else {
  // Let's just search for isWatchingAd anywhere near a render
  const uiIdx2 = lines.findIndex(l => l.includes('{isWatchingAd'));
  if(uiIdx2 !== -1) {
     console.log(lines.slice(uiIdx2 - 5, uiIdx2 + 15).join('\n'));
  }
}
