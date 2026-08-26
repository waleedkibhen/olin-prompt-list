const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalAdManager.tsx', 'utf8');

const newCode = `import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function GlobalAdManager() {
  const location = useLocation();

  useEffect(() => {
    // Override addEventListener once to sandbox Monetag
    if (!(window as any)._monetagSandboxed) {
      (window as any)._monetagSandboxed = true;
      const originalAddEventListener = document.addEventListener;
      document.addEventListener = function(type, listener, options) {
        if (type === 'click' || type === 'pointerdown' || type === 'mousedown' || type === 'touchstart') {
          const originalListener = typeof listener === 'function' ? listener : listener.handleEvent;
          const wrappedListener = function(e: any) {
            const isDashboard = window.location.pathname === '/dashboard';
            const isModalOpen = document.body.classList.contains('post-modal-open');
            if (!isDashboard && !isModalOpen) {
              // Block monetag's listeners if we are not allowed to show ads
              // (Monetag listeners usually don't have a name or are minified, but we just block all global document click listeners since React binds to #root)
              return;
            }
            if (typeof listener === 'function') {
              return listener.call(this, e);
            } else {
              return listener.handleEvent(e);
            }
          };
          if (typeof listener === 'function') {
            return originalAddEventListener.call(this, type, wrappedListener, options);
          } else {
            return originalAddEventListener.call(this, type, { ...listener, handleEvent: wrappedListener }, options);
          }
        }
        return originalAddEventListener.call(this, type, listener, options);
      };
      
      const originalWindowAddEventListener = window.addEventListener;
      window.addEventListener = function(type, listener, options) {
        if (type === 'click' || type === 'pointerdown' || type === 'mousedown' || type === 'touchstart') {
          const originalListener = typeof listener === 'function' ? listener : listener.handleEvent;
          const wrappedListener = function(e: any) {
            const isDashboard = window.location.pathname === '/dashboard';
            const isModalOpen = document.body.classList.contains('post-modal-open');
            if (!isDashboard && !isModalOpen) {
              return;
            }
            if (typeof listener === 'function') {
              return listener.call(this, e);
            } else {
              return listener.handleEvent(e);
            }
          };
          if (typeof listener === 'function') {
            return originalWindowAddEventListener.call(this, type, wrappedListener, options);
          } else {
            return originalWindowAddEventListener.call(this, type, { ...listener, handleEvent: wrappedListener }, options);
          }
        }
        return originalWindowAddEventListener.call(this, type, listener, options);
      };
    }

    let checkInterval = setInterval(() => {
      const isDashboard = location.pathname === '/dashboard';
      const isModalOpen = document.body.classList.contains('post-modal-open');
      const shouldShowVignette = isDashboard || isModalOpen;

      if (shouldShowVignette) {
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
        
        const suspectElements = document.querySelectorAll('body > div, body > iframe');
        suspectElements.forEach((node) => {
          if (node.id === 'root') return;
          const elNode = node as HTMLElement;
          const zIndex = window.getComputedStyle(elNode).zIndex;
          const pos = window.getComputedStyle(elNode).position;
          // Clean up large fixed overlays
          if (pos === 'fixed' && zIndex && parseInt(zIndex, 10) > 9000) {
            elNode.remove();
          }
        });
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
  }, [location.pathname]);

  return null;
}
`;

fs.writeFileSync('src/components/GlobalAdManager.tsx', newCode);
console.log("Updated GlobalAdManager with event listener sandbox");
