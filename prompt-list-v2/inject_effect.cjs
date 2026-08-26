const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const effectCode = `  // Inject Monetag script when the modal opens for ad-supported posts
  useEffect(() => {
    if (isAdSupported && isModalOpen && !isUnlocked) {
      const scriptId = 'monetag-vignette-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.dataset.zone = '11641986';
        script.src = 'https://n6wxm.com/vignette.min.js';
        document.head.appendChild(script);
      }
    }
  }, [isAdSupported, isModalOpen, isUnlocked]);`;

// Insert the effect after `const [adDelayComplete, setAdDelayComplete] = useState<boolean>(!isAdSupported);`
const targetLine = 'const [adDelayComplete, setAdDelayComplete] = useState<boolean>(!isAdSupported);';
code = code.replace(targetLine, targetLine + '\n\n' + effectCode);

// Remove the inline script injection from handleWatchAdToUnlock
const clickTarget = /\/\/ Dynamically inject the exact Monetag Vignette Script provided[\s\S]*?\)\);/;
code = code.replace(clickTarget, `// The Monetag script is already injected on modal open.
    // The click itself will be intercepted by Monetag's listener.`);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated PromptCard with pre-load effect");
