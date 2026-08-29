import React from 'react';
import { Info, Lock, Users, DollarSign, X } from 'lucide-react';

interface MonetizationInfoModalProps {
  onClose: () => void;
}

export default function MonetizationInfoModal({ onClose }: MonetizationInfoModalProps) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div 
        style={{ 
          maxWidth: '440px', 
          width: '100%',
          borderRadius: '1rem',
          border: '1px solid #27272a',
          backgroundColor: '#0F0F11',
          color: '#ffffff',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative' 
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>
            <Info size={20} style={{ color: '#a1a1aa' }} />
            How Creator Monetization Works
          </h3>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ fontSize: '0.95rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Lock size={16} style={{ color: '#a1a1aa' }} /> Direct Prompt Purchases
            </h4>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              Set a fixed price between $1 and $50 on any prompt. Buyers pay once to unlock it instantly. 0% Platform Fee — you keep 100% of every sale (standard card processing fees via Whop apply).
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <Users size={16} style={{ color: '#a1a1aa' }} /> Monthly Creator Subscriptions
            </h4>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              Offer a Creator Membership and unlock recurring revenue. Subscribers get access to every Subscriber-Only prompt you publish, automatically.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <DollarSign size={16} style={{ color: '#a1a1aa' }} /> Payouts &amp; Thresholds
            </h4>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              Withdraw your earnings directly to your payout account once your total balance reaches the $5.00 minimum threshold.
            </p>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={onClose} 
            className="btn-solid"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
