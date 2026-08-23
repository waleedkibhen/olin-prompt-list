const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const badState = `const [adDelayComplete, setAdDelayComplete] = useState(false);

  useEffect(() => {
    if (effectiveMonetization === 'ad_supported') {
      const timer = setTimeout(() => {
        setAdDelayComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAdDelayComplete(true);
    }
  }, [effectiveMonetization]);`;

code = code.replace(badState, '');

const insertTarget = "const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free'));";
code = code.replace(insertTarget, insertTarget + "\n\n  " + badState + "\n");

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Moved adDelayComplete state');
