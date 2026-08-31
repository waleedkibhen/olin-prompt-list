import React from 'react';
import { Info, Lock, Users, DollarSign, X } from 'lucide-react';

interface MonetizationInfoModalProps {
  onClose: () => void;
}

export default function MonetizationInfoModal({ onClose }: MonetizationInfoModalProps) {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 100, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{ 
          maxWidth: '520px', 
          width: '100%',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          backgroundColor: '#0d0d10',
          color: 'var(--text-primary)',
          padding: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          position: 'relative' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <h3 
            style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.65rem', 
              fontSize: '1.25rem', 
              fontWeight: 600,
              letterSpacing: '0.01em',
              color: 'var(--text-primary)'
            }}
          >
            <Info size={20} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            How Creator Monetization Works
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Benefit Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Direct Purchases */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                backgroundColor: '#222226', 
                border: 'none',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}
            >
              <Lock size={18} style={{ color: '#e4e4e7' }} />
            </div>
            <div>
              <h4 
                style={{ 
                  margin: '0 0 0.35rem 0', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.98rem', 
                  fontWeight: 600,
                  letterSpacing: '0.015em'
                }}
              >
                Direct Prompt Purchases
              </h4>
              <p 
                style={{ 
                  margin: 0, 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.88rem', 
                  lineHeight: 1.55,
                  letterSpacing: '0.01em'
                }}
              >
                Set a fixed price between $1 and $50 on any prompt. Buyers pay once to unlock it instantly. <strong style={{ color: '#10b981', fontWeight: 600 }}>0% Platform Fee</strong>, you keep 100% of every sale (standard payment processing fees via Whop apply).
              </p>
            </div>
          </div>

          {/* Monthly Subscriptions */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                backgroundColor: '#222226', 
                border: 'none',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}
            >
              <Users size={18} style={{ color: '#e4e4e7' }} />
            </div>
            <div>
              <h4 
                style={{ 
                  margin: '0 0 0.35rem 0', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.98rem', 
                  fontWeight: 600,
                  letterSpacing: '0.015em'
                }}
              >
                Monthly Creator Subscriptions
              </h4>
              <p 
                style={{ 
                  margin: 0, 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.88rem', 
                  lineHeight: 1.55,
                  letterSpacing: '0.01em'
                }}
              >
                Offer a recurring Creator Membership to earn sustainable income. Subscribers automatically gain access to your entire vault of subscriber only prompts.
              </p>
            </div>
          </div>

          {/* Payouts & Thresholds */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div 
              style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                backgroundColor: '#222226', 
                border: 'none',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}
            >
              <DollarSign size={18} style={{ color: '#e4e4e7' }} />
            </div>
            <div>
              <h4 
                style={{ 
                  margin: '0 0 0.35rem 0', 
                  color: 'var(--text-primary)', 
                  fontSize: '0.98rem', 
                  fontWeight: 600,
                  letterSpacing: '0.015em'
                }}
              >
                Payouts &amp; Thresholds
              </h4>
              <p 
                style={{ 
                  margin: 0, 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.88rem', 
                  lineHeight: 1.55,
                  letterSpacing: '0.01em'
                }}
              >
                Withdraw your earnings directly to your PayPal, Wise, or USDT (Tron / Solana) account once your available balance reaches the $5.00 minimum threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem' }}>
          <button 
            type="button"
            onClick={onClose} 
            className="btn-solid"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
