const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const \[isWatchingAd, setIsWatchingAd\] = useState\(false\);/;
const replacement = `const [isWatchingAd, setIsWatchingAd] = useState(false);

  // Universal Ad Injection for ALL posts when modal is open
  useEffect(() => {
    if (isModalOpen) {
      if (!document.getElementById('monetag-vignette')) {
        // Proxy document.write to prevent Monetag from nuking the SPA DOM and causing a blank screen
        const originalWrite = document.write;
        document.write = function() { console.warn('Intercepted document.write from Monetag to prevent blank screen'); };

        (function(s){
          s.id = 'monetag-vignette';
          s.dataset.zone = '11641986';
          s.src = 'https://n6wxm.com/vignette.min.js';
        })([document.documentElement, document.body].filter(Boolean).pop()!.appendChild(document.createElement('script')));

        // Restore document.write after script has loaded
        setTimeout(() => {
          if (document.write !== originalWrite) {
             document.write = originalWrite;
          }
        }, 3000);
      }
      
      document.body.classList.add('post-modal-open');
    } else {
      document.body.classList.remove('post-modal-open');
    }

    return () => {
      document.body.classList.remove('post-modal-open');
      const el = document.getElementById('monetag-vignette');
      if (el) el.remove();
    };
  }, [isModalOpen]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Added safe global injection to PromptCard");
