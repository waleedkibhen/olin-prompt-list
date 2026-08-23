const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const lines = code.split('\n');
const newLines = [];
let foundFirst = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const [isUnlocked, setIsUnlocked] = useState(false);')) {
    if (!foundFirst) {
      foundFirst = true;
      newLines.push(lines[i]);
    }
  } else {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync(p, newLines.join('\n'));
console.log('deduped');
