import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function GlobalAdManager() {
  const location = useLocation();

  useEffect(() => {
    // Sandbox Monetag's ability to open popups or navigate when not allowed
    if (!(window as any)._monetagSandboxed) {
      (window as any)._monetagSandboxed = true;
      
      const originalWindowOpen = window.open;
      window.open = function(url, target, features) {
        const isDashboard = window.location.pathname === '/dashboard';
        const isModalOpen = document.body.classList.contains('post-modal-open');
        const isAllowed = isDashboard || isModalOpen || (window as any)._allowPopups;
        if (!isAllowed) {
          console.warn('Blocked Monetag popup on unauthorized page');
          return null;
        }
        return originalWindowOpen.call(this, url, target, features);
      };
      
      // We cannot easily intercept window.location assignments if they do that, 
      // but usually vignette ads use window.open for popunders or append anchor tags.
      
      // Override appendChild for document.body to catch hidden anchor clicks
      const originalAppendChild = document.body.appendChild;
      document.body.appendChild = function<T extends Node>(node: T): T {
        const isDashboard = window.location.pathname === '/dashboard';
        const isModalOpen = document.body.classList.contains('post-modal-open');
        
        if (!isDashboard && !isModalOpen) {
          if (node instanceof HTMLAnchorElement || (node as any).tagName === 'A') {
            const aNode = node as unknown as HTMLAnchorElement;
            // If monetag tries to append a hidden anchor to simulate a click
            if (aNode.href && aNode.href.includes('n6wxm') || aNode.href.includes('monetag')) {
              console.warn('Blocked Monetag anchor injection');
              return node; // Don't append
            }
          }
        }
        return originalAppendChild.call(this, node) as T;
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
