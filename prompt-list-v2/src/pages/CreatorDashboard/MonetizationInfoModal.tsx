import React from 'react';
import { Info, Lock, PlayCircle, DollarSign, X } from 'lucide-react';

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
              <Lock size={16} style={{ color: '#a1a1aa' }} /> Paid Prompts (0% Platform Fee)
            </h4>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              When someone purchases your prompt, you keep 100% of your earnings minus standard card processing fees (2.7% + $0.30 via Whop). We charge 0% in platform fees.
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
              <PlayCircle size={16} style={{ color: '#a1a1aa' }} /> Ad Revenue Pool
            </h4>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              Earn passive income simply by publishing quality prompts. All ad revenue is pooled at the end of each month and distributed to creators with 1,000+ views based on their total share of platform impressions.
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
