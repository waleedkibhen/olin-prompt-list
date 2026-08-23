const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Add state
const stateImportTarget = "const [isReportModalOpen, setIsReportModalOpen] = useState(false);";
const stateImportStr = `const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [adDelayComplete, setAdDelayComplete] = useState(false);

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

code = code.replace(stateImportTarget, stateImportStr);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Added state');
