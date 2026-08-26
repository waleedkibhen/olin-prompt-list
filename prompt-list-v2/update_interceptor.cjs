const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ Intercept document\.addEventListener to trap Monetag's global click listeners[\s\S]*?\}, 2000\);\r?\n\s*\}\r?\n\s*\}/;

const replacement = `// Intercept document & window addEventListener to trap Monetag's global click listeners
        originalAddEventListener = document.addEventListener;
        const originalWindowAddEventListener = window.addEventListener;
        
        const interceptor = function(original: any) {
          return function(this: any, type: string, listener: any, options: any) {
            if (type === 'click' || type === 'mousedown' || type === 'touchstart' || type === 'pointerdown') {
              monetagListeners.push({ target: this, type, listener, options });
            }
            return original.call(this, type, listener, options);
          };
        };

        document.addEventListener = interceptor(originalAddEventListener);
        window.addEventListener = interceptor(originalWindowAddEventListener);

        const script = document.createElement('script');
        script.id = scriptId;
        script.dataset.zone = '11641986';
        script.src = 'https://n6wxm.com/vignette.min.js';
        document.head.appendChild(script);

        cleanupTimeout = setTimeout(() => {
          if (document.addEventListener !== originalAddEventListener) document.addEventListener = originalAddEventListener;
          if (window.addEventListener !== originalWindowAddEventListener) window.addEventListener = originalWindowAddEventListener;
        }, 2000);
      }
    }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated interceptor to include window");
