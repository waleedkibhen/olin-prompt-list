const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

if (!css.includes('color-scheme: dark;')) {
  css = css.replace(
    ':root {',
    `:root {
  color-scheme: dark;`
  );
  fs.writeFileSync('src/index.css', css);
}
