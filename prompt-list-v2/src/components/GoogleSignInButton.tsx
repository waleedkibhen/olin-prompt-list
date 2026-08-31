import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

interface GoogleSignInButtonProps {
  className?: string;
  style?: React.CSSProperties;
  text?: string;
  onSuccess?: () => void;
}

const GoogleLogo = () => (
  <div style={{
    width: '24px', height: '24px', backgroundColor: '#ffffff', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px'
  }}>
    <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/24/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  </div>
);

export default function GoogleSignInButton({ 
  className = "btn-solid", 
  style = {}, 
  text = "Continue with Google",
  onSuccess
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [agreed, setAgreed] = useState(false);

  const handleSignIn = async () => {
    await signInWithGoogle();
    if (onSuccess) onSuccess();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', alignItems: 'center', ...style }}>
      <button 
        type="button"
        className={className} 
        onClick={handleSignIn}
        disabled={!agreed}
        style={{ 
          opacity: agreed ? 1 : 0.5, 
          cursor: agreed ? 'pointer' : 'not-allowed', 
          width: '100%',
          maxWidth: '340px',
          background: 'var(--cta-primary, #2563eb)',
          color: '#ffffff',
          border: 'none',
          padding: '0.45rem 1.25rem 0.45rem 0.45rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '0.92rem',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { if (agreed) e.currentTarget.style.backgroundColor = 'var(--cta-primary-hover, #1d4ed8)'; }}
        onMouseLeave={(e) => { if (agreed) e.currentTarget.style.backgroundColor = 'var(--cta-primary, #2563eb)'; }}
      >
        <GoogleLogo />
        <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
      </button>
      <label style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(0.7rem, 2.5vw, 0.78rem)', color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', width: '100%', maxWidth: '360px', padding: '0 0.25rem' }}>
        <input 
          type="checkbox" 
          checked={agreed} 
          onChange={(e) => setAgreed(e.target.checked)} 
          style={{ accentColor: '#3b82f6', width: '15px', height: '15px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer' }} 
        />
        <span style={{ whiteSpace: 'nowrap', lineHeight: 1.2 }}>
          I agree to the <Link to="/terms" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </span>
      </label>
    </div>
  );
}
