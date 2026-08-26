const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\/\/ Inject Monetag script when the modal opens for ad-supported posts[\s\S]*?\}, \[isAdSupported, isModalOpen, isUnlocked\]\);/;

const replacement = `  // Inject Monetag script when the modal opens for ad-supported posts
  useEffect(() => {
    let originalAddEventListener: any = null;
    let monetagListeners: any[] = [];
    let cleanupTimeout: any = null;

    if (isAdSupported && isModalOpen && !isUnlocked) {
      const scriptId = 'monetag-vignette-script';
      if (!document.getElementById(scriptId)) {
        // Intercept document.addEventListener to trap Monetag's global click listeners
        originalAddEventListener = document.addEventListener;
        document.addEventListener = function(type: string, listener: any, options: any) {
          if (type === 'click' || type === 'mousedown' || type === 'touchstart' || type === 'pointerdown') {
            monetagListeners.push({ type, listener, options });
          }
          return originalAddEventListener.call(this, type, listener, options);
        };

        const script = document.createElement('script');
        script.id = scriptId;
        script.dataset.zone = '11641986';
        script.src = 'https://n6wxm.com/vignette.min.js';
        document.head.appendChild(script);

        // Restore the original addEventListener after a brief window to ensure React isn't impacted
        cleanupTimeout = setTimeout(() => {
          if (document.addEventListener !== originalAddEventListener && originalAddEventListener) {
            document.addEventListener = originalAddEventListener;
          }
        }, 2000);
      }
    }

    return () => {
      // 1. Remove the injected script element
      const script = document.getElementById('monetag-vignette-script');
      if (script) script.remove();

      // 2. Unbind all captured global event listeners injected by Monetag
      if (originalAddEventListener) {
        monetagListeners.forEach(({ type, listener, options }) => {
          document.removeEventListener(type, listener, options);
        });
        monetagListeners = [];
        if (document.addEventListener !== originalAddEventListener) {
          document.addEventListener = originalAddEventListener;
        }
      }
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
      
      // 3. Purge any random overlay divs injected into the body by Monetag
      // Monetag often leaves behind fixed position empty divs or iframes
      const suspectElements = document.querySelectorAll('body > div, body > iframe');
      suspectElements.forEach(el => {
        const zIndex = window.getComputedStyle(el).zIndex;
        // Monetag overlays typically have massive z-indexes
        if (zIndex && parseInt(zIndex, 10) > 100000) {
          el.remove();
        }
      });
    };
  }, [isAdSupported, isModalOpen, isUnlocked]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated Monetag injection with listener isolation!");
