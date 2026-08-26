const fs = require('fs');
const path = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\ee7b1da3-3645-4699-8777-9ef747901d26\\task.md';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /\[ \] Redesign Skeleton UI/,
  `[x] Redesign Skeleton UI`
);
code = code.replace(
  /\[ \] Restore Missing Adsterra Ad Slot/,
  `[x] Restore Missing Adsterra Ad Slot`
);

fs.writeFileSync(path, code);
console.log('Updated task.md');
