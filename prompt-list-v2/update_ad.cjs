const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalAdManager.tsx', 'utf8');

const regex = /if \(!document\.getElementById\('monetag-vignette'\)\) \{[\s\S]*?\}, 500\);/g;

const newLogic = `
      if (shouldShowVignette) {
        // Inject script if not present
        if (!document.getElementById('monetag-vignette')) {
          const originalWrite = document.write;
          document.write = function() { console.warn('Intercepted document.write from Monetag'); };

          const s = document.createElement('script');
          s.id = 'monetag-vignette';
          s.dataset.zone = '11641986';
          s.src = 'https://n6wxm.com/vignette.min.js';
          document.head.appendChild(s);
          
          setTimeout(() => {
            if (document.write !== originalWrite) {
               document.write = originalWrite;
            }
          }, 3000);
        }
      } else {
        const sv = document.getElementById('monetag-vignette');
        if (sv) sv.remove();
        
        const sp = document.getElementById('monetag-push-script');
        if (sp) sp.remove();
        
        // Purge existing
        const suspectElements = document.querySelectorAll('body > div:not(#root), body > iframe');
        suspectElements.forEach((node) => {
          node.remove();
        });
      }
    }, 200);

    // Active shield: MutationObserver to instantly kill any ad overlays injected while on Discovery feed
    const observer = new MutationObserver((mutations) => {
      const isDiscoverFeed = window.location.pathname === '/';
      const isProfile = window.location.pathname === '/profile' || window.location.pathname.startsWith('/creator/');
      const isCreate = window.location.pathname === '/create';
      const isDashboard = window.location.pathname === '/dashboard';
      const isModalOpen = document.body.classList.contains('post-modal-open');
      const shouldShowVignette = isDashboard || isModalOpen;

      if (!shouldShowVignette) {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const el = node as HTMLElement;
              if (el.id !== 'root' && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                el.remove();
              }
            }
          });
        });
      }
    });

    observer.observe(document.body, { childList: true });

    return () => {
      clearInterval(checkInterval);
      observer.disconnect();
    };
`;

code = code.replace(/if \(shouldShowVignette\) \{[\s\S]*?return \(\) => clearInterval\(checkInterval\);\r?\n/, newLogic);
fs.writeFileSync('src/components/GlobalAdManager.tsx', code);
console.log("Updated GlobalAdManager to use active shield");
