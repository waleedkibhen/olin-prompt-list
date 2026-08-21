const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

if (!code.includes("import WhopCheckoutModal")) {
    code = code.replace(
        "import React, { useState, useRef, useEffect } from 'react';",
        "import React, { useState, useRef, useEffect } from 'react';\nimport WhopCheckoutModal from './WhopCheckoutModal';"
    );
}

if (!code.includes("const [showCheckout, setShowCheckout] = useState(false);")) {
    code = code.replace(
        "const [isWatchingAd, setIsWatchingAd] = useState(false);",
        "const [isWatchingAd, setIsWatchingAd] = useState(false);\n  const [showCheckout, setShowCheckout] = useState(false);"
    );
}

const targetButtonStr = "onClick={(e) => { e.stopPropagation(); alert('Payment infrastructure coming soon!'); handleWatchAdToUnlock(e); }}";
const replaceButtonStr = "onClick={(e) => { e.stopPropagation(); if (post.whopPlanId) { setShowCheckout(true); } else { alert('Creator has not setup a valid checkout for this item yet.'); } }}";
if (code.includes(targetButtonStr)) {
    code = code.replace(targetButtonStr, replaceButtonStr);
}

const modalRender = `
      {showCheckout && post.whopPlanId && (
        <WhopCheckoutModal 
          planId={post.whopPlanId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}
`;

if (!code.includes("<WhopCheckoutModal")) {
    // find {isReportModalOpen && ...} and insert above
    code = code.replace(
        "{isReportModalOpen && <ReportModal",
        modalRender + "\n      {isReportModalOpen && <ReportModal"
    );
}

if (!code.includes("const handlePaymentSuccess = () => {")) {
  const handlePaymentSuccess = `
  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const unlockedRaw = localStorage.getItem('unlockedPrompts');
      const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
      }
    } catch (e) {}
  };
`;
  code = code.replace(
      "const handleWatchAdToUnlock = (e: React.MouseEvent) => {",
      `${handlePaymentSuccess}\n  const handleWatchAdToUnlock = (e: React.MouseEvent) => {`
  );
}

fs.writeFileSync(p, code);
console.log('updated prompt card 2');
