const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `      // Legacy compatibility: Parse manually typed variants like "V1 -" or "Variant 2 -"
      if (/(?:V|Variant)\s*1\s*-/i.test(post.promptText) && /(?:V|Variant)\s*2\s*-/i.test(post.promptText)) {
        const matches = [...post.promptText.matchAll(/(?:^|<p>|<br>|\n)(?:<[^>]+>)*(?:V|Variant)\s*\d+\s*-/gi)];`;
const replace = `      // Legacy compatibility: Parse manually typed variants like "V1 -" or "Variant 2 -"
      if (/(?:V|Variant)\s*1\s*-/i.test(rawPromptText) && /(?:V|Variant)\s*2\s*-/i.test(rawPromptText)) {
        const matches = [...rawPromptText.matchAll(/(?:^|<p>|<br>|\n)(?:<[^>]+>)*(?:V|Variant)\s*\d+\s*-/gi)];`;

code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('fixed regex test');
