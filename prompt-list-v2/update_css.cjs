const fs = require('fs');
const p = 'src/components/PromptCard.module.css';
let css = fs.readFileSync(p, 'utf8');

css = css.replace(
  /border: 1px solid rgba\(16, 185, 129, 0\.45\);\s*border-radius: 0px;/,
  "border: 2px solid #1E50FF;\n  border-radius: 2px;"
);

// We should also remove the green radial gradient from dummyBlurBackground if they want it completely blue theme. But they didn't explicitly ask for that. I will leave it, or maybe change it to blue just in case. They said "Make the color WHOP blue". The gradient is subtle.
css = css.replace(
  /background: radial-gradient\(circle at center, rgba\(16, 185, 129, 0\.08\), transparent 70\%\);/,
  "background: radial-gradient(circle at center, rgba(30, 80, 255, 0.08), transparent 70%);"
);

fs.writeFileSync(p, css);
console.log('updated css');
