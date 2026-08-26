const fs = require('fs');
let code = fs.readFileSync('src/components/AdsterraSocialBar.tsx', 'utf8');

code = `import React, { useEffect } from 'react';

export const AdsterraSocialBar: React.FC = () => {
  useEffect(() => {
    // We intentionally do NOT check for duplicates because we want to trigger the ad 
    // network every time the modal is opened. Adsterra relies on script execution.
    
    // We append a random timestamp to bypass browser caching and force the ad network 
    // to re-evaluate and re-inject the social bar on every view.
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl30941412.profitableratecpmnetwork.com/2d/35/e0/2d35e05573e49e7643e5405557ae36fa.js?cb=' + Date.now();
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Clean up the script tag itself, though Adsterra's injected DOM elements 
      // might remain until they handle their own cleanup.
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
};
`;

fs.writeFileSync('src/components/AdsterraSocialBar.tsx', code);
console.log('Updated AdsterraSocialBar.tsx');
