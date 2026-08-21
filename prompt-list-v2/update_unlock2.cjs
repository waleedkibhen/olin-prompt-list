const fs = require('fs');
const p = 'src/pages/UnlockAdPage.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /backgroundColor: '#10b981'/,
  "backgroundColor: '#1E50FF'"
);

code = code.replace(
  /borderRadius: '8px'/,
  "borderRadius: '4px'"
);

// Oh wait, there is also a shield icon and "Unlock Protected Prompt" text. Maybe we should make the shield blue too.
code = code.replace(
  /<ShieldCheck size=\{48\} color="#10b981" style=\{\{ marginBottom: '1rem' \}\} \/>/,
  '<ShieldCheck size={48} color="#1E50FF" style={{ marginBottom: "1rem" }} />'
);

fs.writeFileSync(p, code);
console.log('updated unlockadpage');
