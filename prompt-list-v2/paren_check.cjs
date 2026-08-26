const fs = require('fs');
const lines = fs.readFileSync('src/components/PromptCard/PromptModal.tsx', 'utf8').split(/\r?\n/);
let depth = 0, inS = false, inD = false, inB = false, inLineC = false, inBlockC = false;
const events = [];
for (let i = 0; i < lines.length; i++) {
  const L = lines[i];
  for (let j = 0; j < L.length; j++) {
    const c = L[j], n = L[j + 1];
    if (inLineC) { break; }
    if (inBlockC) { if (c === '*' && n === '/') { inBlockC = false; j++; } continue; }
    if (inS) { if (c === '\\') { j++; } else if (c === "'") { inS = false; } continue; }
    if (inD) { if (c === '\\') { j++; } else if (c === '"') { inD = false; } continue; }
    if (inB) { if (c === '\\') { j++; } else if (c === '`') { inB = false; } continue; }
    if (c === '/' && n === '/') { break; }
    if (c === '/' && n === '*') { inBlockC = true; j++; continue; }
    if (c === "'") { inS = true; continue; }
    if (c === '"') { inD = true; continue; }
    if (c === '`') { inB = true; continue; }
    if (c === '(' || c === '{' || c === '[') depth++;
    if (c === ')' || c === '}' || c === ']') depth--;
  }
  if (!inB && !inS && !inD && !inBlockC) {
    if (depth !== (events.length ? events[events.length - 1][1] : 0)) events.push([i + 1, depth]);
    if (depth < 0) { console.log('NEGATIVE at line', i + 1); process.exit(0); }
  } else {
    events.push([i + 1, 'inside-string-continuation']);
  }
}
console.log('final depth:', depth);
console.log('depth timeline (line, depthAfterLine):');
events.filter(e => typeof e[1] === 'number' && e[0] >= 140 && e[0] <= 345).forEach(e => console.log(e[0], e[1]));
