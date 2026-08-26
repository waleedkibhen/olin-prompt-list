const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(
  /--bg-primary: #[0-9a-fA-F]+;/i,
  '--bg-primary: #111111;'
);
code = code.replace(
  /--bg-secondary: #[0-9a-fA-F]+;/i,
  '--bg-secondary: #1a1a1a;'
);
code = code.replace(
  /--bg-elevated: #[0-9a-fA-F]+;/i,
  '--bg-elevated: #242424;'
);
code = code.replace(
  /--bg-hover: #[0-9a-fA-F]+;/i,
  '--bg-hover: #333333;'
);
code = code.replace(
  /--border-color: #[0-9a-fA-F]+;/i,
  '--border-color: #333333;'
);

fs.writeFileSync('src/index.css', code);
console.log("Updated colors in index.css");
