const fs = require('fs');
const path = require('path');
const p = path.join('src', 'pages', 'CreatePostPage.tsx');
let code = fs.readFileSync(p, 'utf8');

const descRegex = /<div className=\{styles\.fieldGroup\}>\s*<label>Description <span className=\{styles\.optionalText\}>\(optional\)<\/span><\/label>\s*<TipTapEditor \s*content=\{description\}\s*onChange=\{setDescription\}\s*\/>\s*\{getCharLimitWarning\(description\.replace\(\/\(<\(\[\^>\]\+\)>\)\/gi, ""\)\.length, 1000\)\}\s*<\/div>/;

const match = code.match(descRegex);
if (match) {
  const descBlock = match[0];
  
  // Remove from original place
  code = code.replace(descBlock, '');
  
  // Find where to insert in left column
  const insertRegex = /([ \t]*\}\)\}\r?\n[ \t]*<\/div>\r?\n\s*)(<input type="file" ref=\{fileInputRef\})/g;
  
  if (insertRegex.test(code)) {
    code = code.replace(insertRegex, (m, p1, p2) => {
      return p1 + '\n            <div style={{ marginTop: "1.5rem" }}>\n              ' + descBlock.replace('<div className={styles.fieldGroup}>', '<div className={styles.fieldGroup} style={{ margin: 0 }}>') + '\n            </div>\n\n            ' + p2;
    });
    console.log("Moved description field");
  } else {
    console.log("Could not find insertion target");
  }
} else {
  console.log("Could not find description field");
}

fs.writeFileSync(p, code);
