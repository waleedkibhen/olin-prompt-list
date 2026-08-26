const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');
const lines = code.split('\n');
const idx = lines.findIndex(l => l.includes('className={styles.modalOverlay}'));
if (idx !== -1) console.log(lines.slice(idx - 2, idx + 10).join('\n'));
else {
  const altIdx = lines.findIndex(l => l.includes('isModalOpen && ('));
  if (altIdx !== -1) console.log(lines.slice(altIdx - 2, altIdx + 10).join('\n'));
}
