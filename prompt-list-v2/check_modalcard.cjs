const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('className={styles.modalCard}'));
console.log(lines.slice(idx - 2, idx + 3).join('\n'));
