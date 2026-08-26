const fs = require('fs');
let code = fs.readFileSync('src/components/GoogleSignInButton.tsx', 'utf8');

// The new return statement replacing the current layout
const newReturn = `  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', alignItems: 'center', ...style }}>
      <button 
        type="button"
        className={className} 
        onClick={handleSignIn}
        disabled={!agreed}
        style={{ 
          opacity: agreed ? 1 : 0.5, 
          cursor: agreed ? 'pointer' : 'not-allowed', 
          width: '100%',
          maxWidth: '320px',
          background: '#27272a', /* Dark Gray */
          color: '#ffffff',
          border: '1px solid #3f3f46',
          padding: '0.4rem 1.25rem 0.4rem 0.4rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => { if (agreed) e.currentTarget.style.backgroundColor = '#3f3f46'; }}
        onMouseLeave={(e) => { if (agreed) e.currentTarget.style.backgroundColor = '#27272a'; }}
      >
        <GoogleLogo />
        {text}
      </button>
      <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer', maxWidth: '320px', padding: '0 0.5rem' }}>
        <input 
          type="checkbox" 
          checked={agreed} 
          onChange={(e) => setAgreed(e.target.checked)} 
          style={{ marginTop: '0.2rem', accentColor: '#27272a', width: '16px', height: '16px', borderRadius: '4px' }} 
        />
        <span style={{ lineHeight: 1.4 }}>
          I agree to the <Link to="/terms" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Privacy Policy</Link>
        </span>
      </label>
    </div>
  );
}`;

code = code.replace(/return \([\s\S]*?\);\r?\n\}/, newReturn);
fs.writeFileSync('src/components/GoogleSignInButton.tsx', code);
console.log("Updated GoogleSignInButton layout and style");
