const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ 2\. Unbind all captured global event listeners injected by Monetag[\s\S]*?if \(cleanupTimeout\) clearTimeout\(cleanupTimeout\);/;

const replacement = `// 2. Unbind all captured global event listeners injected by Monetag
      if (originalAddEventListener) {
        monetagListeners.forEach(({ target, type, listener, options }) => {
          target.removeEventListener(type, listener, options);
        });
        monetagListeners = [];
        if (document.addEventListener !== originalAddEventListener) document.addEventListener = originalAddEventListener;
        // The timeout restores window.addEventListener, but we should safely just assume if we had originalAddEventListener, we had both.
      }
      if (cleanupTimeout) clearTimeout(cleanupTimeout);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated cleanup to use target");
