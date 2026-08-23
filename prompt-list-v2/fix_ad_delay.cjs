const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const oldEffect = `useEffect(() => {
    if (effectiveMonetization === 'ad_supported') {
      const timer = setTimeout(() => {
        setAdDelayComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAdDelayComplete(true);
    }
  }, [effectiveMonetization]);`;

const newEffect = `useEffect(() => {
    if (effectiveMonetization === 'ad_supported') {
      if (isModalOpen) {
        setAdDelayComplete(false);
        const timer = setTimeout(() => {
          setAdDelayComplete(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setAdDelayComplete(false);
      }
    } else {
      setAdDelayComplete(true);
    }
  }, [effectiveMonetization, isModalOpen]);`;

code = code.replace(oldEffect, newEffect);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed ad delay logic');
