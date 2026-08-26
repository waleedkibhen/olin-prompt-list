const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';

export default function GlobalAdDisclaimer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('adDisclaimerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    localStorage.setItem('adDisclaimerDismissed', 'true');
    setIsVisible(false);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '800px',
        backgroundColor: '#0F0F11',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}
    >
      <p style={{ margin: 0, color: '#d4d4d8', fontSize: '0.85rem', lineHeight: '1.5', flex: '1 1 300px' }}>
        To keep Olin's Prompt List free and fund our Creator Pool, we use third-party advertising. Ads are marked with an "Ad" label and are not affiliated with or endorsed by our platform.
      </p>
      <button 
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: '1px solid #3f3f46',
          color: '#e4e4e7',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'background-color 0.2s',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        I understand
      </button>
    </div>
  );
}
`;

fs.writeFileSync('src/components/GlobalAdDisclaimer.tsx', code);
console.log("Created GlobalAdDisclaimer.tsx");
