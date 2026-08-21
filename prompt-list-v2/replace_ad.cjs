const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const regex = /const handleWatchAdToUnlock = \(e: React\.MouseEvent\) => \{[\s\S]*?\} catch \(err\) \{\}\s*\},\s*2800\);\s*\};/;
const newFunc = `const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(\`/unlock/\${post.id}\`);
  };`;

if (code.match(regex)) {
  code = code.replace(regex, newFunc);
  fs.writeFileSync(p, code);
  console.log("updated");
} else {
  console.log("not found");
}
