const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

code = code.replace(
  /<div className=\{styles\.skeletonBar\} style=\{\{ width: '100%' \}\} \/>\s*<div className=\{styles\.skeletonBar\} style=\{\{ width: '85%' \}\} \/>\s*<div className=\{styles\.skeletonBar\} style=\{\{ width: '92%' \}\} \/>\s*<div className=\{styles\.skeletonBar\} style=\{\{ width: '65%' \}\} \/>/g,
  `<div className={styles.skeletonBigBox} />`
);

code = code.replace(
  /<div className=\{styles\.skeletonBar\} style=\{\{ width: '100%' \}\} \/>\s*<div className=\{styles\.skeletonBar\} style=\{\{ width: '85%' \}\} \/>\s*<div className=\{styles\.skeletonBar\} style=\{\{ width: '92%' \}\} \/>/g,
  `<div className={styles.skeletonBigBox} />`
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Replaced skeleton bars with big box');
