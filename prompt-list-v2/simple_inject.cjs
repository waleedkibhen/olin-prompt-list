const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /const \[adDelayComplete, setAdDelayComplete\] = useState<boolean>\(!isAdSupported\);/;

const replacement = `const [adDelayComplete, setAdDelayComplete] = useState<boolean>(!isAdSupported);

  // Inject Monetag script when the modal opens for ad-supported posts
  useEffect(() => {
    let scriptEl: HTMLScriptElement | null = null;
    if (isAdSupported && isModalOpen && !isUnlocked) {
      if (!document.getElementById('monetag-vignette')) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'monetag-vignette';
        scriptEl.dataset.zone = '11641986';
        scriptEl.src = 'https://n6wxm.com/vignette.min.js';
        document.head.appendChild(scriptEl);
      }
    }
    return () => {
      const el = document.getElementById('monetag-vignette');
      if (el) el.remove();
    };
  }, [isAdSupported, isModalOpen, isUnlocked]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Added simple script injection");
