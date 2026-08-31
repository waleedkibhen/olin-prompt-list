import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import styles from './dashboard.module.css';

interface PayoutModalProps {
  monetizationStats: any;
  payoutMethod: 'paypal' | 'usdt_trc20' | 'usdt_solana' | 'wise';
  setPayoutMethod: (method: 'paypal' | 'usdt_trc20' | 'usdt_solana' | 'wise') => void;
  payoutDetails: string;
  setPayoutDetails: (details: string) => void;
  payoutAgreed: boolean;
  setPayoutAgreed: (agreed: boolean) => void;
  isSubmittingPayout: boolean;
  handleRequestPayout: () => void;
  onClose: () => void;
}

export default function PayoutModal({
  monetizationStats,
  payoutMethod,
  setPayoutMethod,
  payoutDetails,
  setPayoutDetails,
  payoutAgreed,
  setPayoutAgreed,
  isSubmittingPayout,
  handleRequestPayout,
  onClose
}: PayoutModalProps) {
  // Determine selected top-level method category
  const selectedCategory: 'paypal' | 'wise' | 'crypto' = 
    payoutMethod === 'paypal' ? 'paypal' :
    payoutMethod === 'wise' ? 'wise' : 'crypto';

  const isEligible = monetizationStats.totalRevenue >= 5;

  const handleSelectCategory = (category: 'paypal' | 'wise' | 'crypto') => {
    if (category === 'paypal') {
      setPayoutMethod('paypal');
    } else if (category === 'wise') {
      setPayoutMethod('wise');
    } else if (category === 'crypto') {
      // Default to TRC20 when switching to crypto if not already on a crypto chain
      if (payoutMethod !== 'usdt_trc20' && payoutMethod !== 'usdt_solana') {
        setPayoutMethod('usdt_trc20');
      }
    }
    setPayoutDetails('');
  };

  const handleSelectChain = (chain: 'usdt_trc20' | 'usdt_solana') => {
    setPayoutMethod(chain);
    setPayoutDetails('');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={styles.modalContent} 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          borderRadius: '16px', 
          backgroundColor: '#0d0d10',
          border: '1px solid var(--border-color)',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Request Payout
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div 
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Available Balance</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ${monetizationStats.totalRevenue.toFixed(2)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: isEligible ? '#10b981' : 'var(--text-secondary)', lineHeight: 1.4 }}>
            {isEligible 
              ? "✓ Minimum $5.00 threshold reached. Direct disbursements are processed to your selected account."
              : `You need $${(5 - monetizationStats.totalRevenue).toFixed(2)} more to reach the $5.00 minimum withdrawal threshold.`}
          </p>
        </div>

        {/* Payout Methods Selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.65rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Select Payout Method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            {/* PayPal */}
            <button
              type="button"
              onClick={() => handleSelectCategory('paypal')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 0.5rem',
                borderRadius: '10px',
                border: `2px solid ${selectedCategory === 'paypal' ? '#3b82f6' : 'var(--border-color)'}`,
                backgroundColor: selectedCategory === 'paypal' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <img 
                src="/logos/paypal.svg" 
                alt="PayPal" 
                style={{ height: '22px', width: 'auto', objectFit: 'contain' }} 
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedCategory === 'paypal' ? '#ffffff' : 'var(--text-secondary)' }}>
                PayPal
              </span>
            </button>

            {/* Wise */}
            <button
              type="button"
              onClick={() => handleSelectCategory('wise')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 0.5rem',
                borderRadius: '10px',
                border: `2px solid ${selectedCategory === 'wise' ? '#3b82f6' : 'var(--border-color)'}`,
                backgroundColor: selectedCategory === 'wise' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <img 
                src="/logos/wise.webp" 
                alt="Wise" 
                style={{ height: '22px', width: 'auto', objectFit: 'contain', borderRadius: '4px' }} 
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedCategory === 'wise' ? '#ffffff' : 'var(--text-secondary)' }}>
                Wise
              </span>
            </button>

            {/* USDT Crypto */}
            <button
              type="button"
              onClick={() => handleSelectCategory('crypto')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem 0.5rem',
                borderRadius: '10px',
                border: `2px solid ${selectedCategory === 'crypto' ? '#3b82f6' : 'var(--border-color)'}`,
                backgroundColor: selectedCategory === 'crypto' ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <img 
                src="/logos/usdt.png" 
                alt="USDT" 
                style={{ height: '22px', width: 'auto', objectFit: 'contain' }} 
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedCategory === 'crypto' ? '#ffffff' : 'var(--text-secondary)' }}>
                USDT
              </span>
            </button>
          </div>
        </div>

        {/* Crypto Chain Selection (if USDT chosen) */}
        {selectedCategory === 'crypto' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Select Network / Blockchain
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {/* Tron */}
              <button
                type="button"
                onClick={() => handleSelectChain('usdt_trc20')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${payoutMethod === 'usdt_trc20' ? '#ef4444' : 'var(--border-color)'}`,
                  backgroundColor: payoutMethod === 'usdt_trc20' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img 
                  src="/logos/tron.png" 
                  alt="Tron" 
                  style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '50%' }} 
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tron</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>TRC-20</div>
                </div>
              </button>

              {/* Solana */}
              <button
                type="button"
                onClick={() => handleSelectChain('usdt_solana')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: `1.5px solid ${payoutMethod === 'usdt_solana' ? '#a855f7' : 'var(--border-color)'}`,
                  backgroundColor: payoutMethod === 'usdt_solana' ? 'rgba(168, 85, 247, 0.08)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <img 
                  src="/logos/solana.webp" 
                  alt="Solana" 
                  style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' }} 
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>Solana</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>SPL Token</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Detail Input */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {payoutMethod === 'paypal' ? 'PayPal Email Address' :
             payoutMethod === 'wise' ? 'Wise Account Email' :
             payoutMethod === 'usdt_trc20' ? 'Tron (TRC-20) USDT Address' :
             'Solana (SPL) USDT Address'}
          </label>
          <input 
            type={payoutMethod === 'paypal' || payoutMethod === 'wise' ? 'email' : 'text'}
            value={payoutDetails}
            onChange={(e) => setPayoutDetails(e.target.value)}
            placeholder={
              payoutMethod === 'paypal' ? "your-paypal@example.com" :
              payoutMethod === 'wise' ? "your-wise@example.com" :
              payoutMethod === 'usdt_trc20' ? "T... (Tron TRC-20 Address)" :
              "Solana address (e.g. 7xKX...)"
            }
            style={{ 
              width: '100%', 
              padding: '0.75rem 0.9rem', 
              borderRadius: '8px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              color: '#fff', 
              fontSize: '0.92rem',
              outline: 'none'
            }}
          />
          <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {payoutMethod === 'paypal' ? 'Funds are sent directly to your registered PayPal account.' :
             payoutMethod === 'wise' ? 'Funds are sent directly to your Wise account email.' :
             payoutMethod === 'usdt_trc20' ? 'Please double check that this is a valid TRC-20 USDT address.' :
             'Please double check that this is a valid Solana SPL USDT address.'}
          </p>
        </div>

        {/* Confirmation Agreement */}
        <label 
          style={{ 
            display: 'flex', 
            gap: '0.65rem', 
            alignItems: 'flex-start', 
            fontSize: '0.82rem', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            marginBottom: '1.5rem',
            lineHeight: 1.45
          }}
        >
          <input 
            type="checkbox" 
            checked={payoutAgreed} 
            onChange={(e) => setPayoutAgreed(e.target.checked)} 
            style={{ 
              marginTop: '0.15rem', 
              accentColor: '#3b82f6', 
              width: '16px', 
              height: '16px', 
              borderRadius: '4px', 
              flexShrink: 0 
            }} 
          />
          <span>
            I confirm that my payout details and selected network/email are 100% accurate. I understand that transfers sent to incorrect details cannot be recovered or refunded.
          </span>
        </label>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button 
            type="button"
            className={styles.modalCancelBtn} 
            onClick={onClose}
            disabled={isSubmittingPayout}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="btn-solid" 
            onClick={handleRequestPayout}
            disabled={isSubmittingPayout || !payoutDetails.trim() || !isEligible || !payoutAgreed}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
          >
            {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
