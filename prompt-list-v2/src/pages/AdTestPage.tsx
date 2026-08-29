import React, { useEffect } from 'react';
import { ENABLE_ADS } from '@/lib/config';

const AdTestPage = () => {
  useEffect(() => {
    if (!ENABLE_ADS) return;
    // Safely inject the script only when this component mounts
    const script = document.createElement('script');
    script.src = 'https://pl30941411.effectivecpmnetwork.com/d0/cd/78/d0cd78e0f7daecfe6effe9409b414efc.js';
    script.async = true;
    
    document.body.appendChild(script);

    // Cleanup when component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <h1>Ad Network Test Route</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
        This isolated route is used for safely testing ad network scripts without affecting live users.
      </p>
      <button 
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600
        }}
        onClick={() => console.log('Test Click')}
      >
        Test Click
      </button>
    </div>
  );
};

export default AdTestPage;
