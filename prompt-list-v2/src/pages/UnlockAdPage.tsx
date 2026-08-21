import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UnlockAdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clicked, setClicked] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Inject the adsterra script into head so it's ready to catch the first click
    const script = document.createElement('script');
    script.src = 'https://pl30941411.effectivecpmnetwork.com/d0/cd/78/d0cd78e0f7daecfe6effe9409b414efc.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (clicked) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Unlock the prompt and redirect back
        const storageKey = user ? `unlocked_${user.uid}` : 'unlocked_guest';
        const unlockedArr = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!unlockedArr.includes(id)) {
          localStorage.setItem(storageKey, JSON.stringify([...unlockedArr, id]));
        }
        navigate(`/post/${id}`);
      }
    }
  }, [clicked, countdown, id, navigate, user]);

  const handleWatchAd = () => {
    // The click itself will trigger the adsterra popunder because it's loaded in the head!
    setClicked(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <ShieldCheck size={48} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
      <h1 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Unlock Protected Prompt</h1>
      
      {!clicked ? (
        <>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', lineHeight: '1.6' }}>
            The creator has chosen to monetize their prompts through ads, and click the button below to view a quick sponsor message or click the button below to watch an ad to reveal the prompt.
          </p>
          <button
            onClick={handleWatchAd}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Watch Ad
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 500, marginBottom: '1rem' }}>
            Thank you for supporting creators!
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            Unlocking prompt in {countdown}...
          </p>
        </>
      )}
    </div>
  );
}
