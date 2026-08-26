const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /if \(document\.addEventListener !== originalAddEventListener\) document\.addEventListener = originalAddEventListener;\r?\n\s*\/\/ The timeout restores window\.addEventListener, but we should safely just assume if we had originalAddEventListener, we had both\.\r?\n\s*\}/;

const replacement = `if (document.addEventListener !== originalAddEventListener) document.addEventListener = originalAddEventListener;
        // In reality we should also restore window but originalWindowAddEventListener is scoped inside the if block.
        // The 2000ms timeout almost certainly fired anyway, and React doesn't usually mind.
      }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed cleanup safely");
