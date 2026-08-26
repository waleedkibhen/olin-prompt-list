const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /document\.body\.classList\.remove\('post-modal-open'\);\r?\n\s*const el = document\.getElementById\('monetag-vignette'\);\r?\n\s*if \(el\) el\.remove\(\);/;

const replacement = `document.body.classList.remove('post-modal-open');
      const el = document.getElementById('monetag-vignette');
      if (el) el.remove();
      
      // Purge any residual full-screen overlays Monetag might leave behind causing a "blank screen"
      setTimeout(() => {
        if (!document.body.classList.contains('post-modal-open')) {
          const suspectElements = document.querySelectorAll('body > div, body > iframe');
          suspectElements.forEach((node) => {
            if (node.id === 'root') return;
            const elNode = node as HTMLElement;
            const zIndex = window.getComputedStyle(elNode).zIndex;
            const pos = window.getComputedStyle(elNode).position;
            if (pos === 'fixed' && zIndex && parseInt(zIndex, 10) > 9000) {
              elNode.remove();
            }
          });
        }
      }, 500);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Added overlay sweeper");
