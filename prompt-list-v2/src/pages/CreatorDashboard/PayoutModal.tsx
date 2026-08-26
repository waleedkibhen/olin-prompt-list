import React from 'react';
import { Award } from 'lucide-react';
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
  monetizationStats, payoutMethod, setPayoutMethod, payoutDetails, setPayoutDetails, payoutAgreed, setPayoutAgreed, isSubmittingPayout, handleRequestPayout, onClose
}: PayoutModalProps) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
        <h3 className={styles.modalTitle} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: 'var(--text-muted)' }} />
          Request Payout
        </h3>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Available Balance:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>${monetizationStats.totalRevenue.toFixed(2)}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {monetizationStats.totalRevenue >= 5 
              ? "You have reached the minimum $5.00 threshold. Withdrawals are reviewed and processed at the end of the current month."
              : `You need ${(5 - monetizationStats.totalRevenue).toFixed(2)} more to reach the $5.00 minimum withdrawal threshold.`}
          </p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Select Payout Method</label>
            <select 
              value={payoutMethod}
              onChange={(e) => {
                setPayoutMethod(e.target.value as any);
                setPayoutDetails('');
              }}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0F0F11', border: '1px solid #27272a', color: '#fff', fontSize: '0.95rem' }}
            >
              <option value="paypal">PayPal (Email)</option>
              <option value="usdt_trc20">USDT — TRC20 (Tron Network)</option>
              <option value="usdt_solana">USDT — Solana (SPL)</option>
              <option value="wise">Wise (Email Transfer)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
              {payoutMethod === 'paypal' ? 'PayPal Email Address' : 
               payoutMethod === 'usdt_trc20' ? 'Your TRC20 (Tron) USDT Address' : 
               payoutMethod === 'usdt_solana' ? 'Your Solana USDT Address' :
               'Recipient\'s Wise Account Email'}
            </label>
            <input 
              type={payoutMethod === 'paypal' || payoutMethod === 'wise' ? 'email' : 'text'}
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder={
                payoutMethod === 'paypal' || payoutMethod === 'wise' ? "yourname@example.com" : 
                payoutMethod === 'usdt_trc20' ? "T..." : 
                "Solana address..."
              }
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: '#0F0F11', border: '1px solid #27272a', color: '#fff', fontSize: '0.95rem' }}
            />
          </div>
        </div>

        <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: '#a1a1aa', textAlign: 'left', cursor: 'pointer', marginBottom: '2rem' }}>
          <input 
            type="checkbox" 
            checked={payoutAgreed} 
            onChange={(e) => setPayoutAgreed(e.target.checked)} 
            style={{ marginTop: '0.2rem', accentColor: '#3b82f6', width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0 }} 
          />
          <span style={{ lineHeight: 1.4 }}>
            I confirm that my payout details and selected network/email are 100% accurate. I understand that payouts sent to incorrect addresses or details cannot be recovered or refunded.
          </span>
        </label>

        <div className={styles.modalActions}>
          <button 
            className={styles.modalCancelBtn} 
            onClick={onClose}
            disabled={isSubmittingPayout}
          >
            Cancel
          </button>
          <button 
            className="btn-solid" 
            onClick={handleRequestPayout}
            disabled={isSubmittingPayout || !payoutDetails.trim() || monetizationStats.totalRevenue < 5 || !payoutAgreed}
          >
            {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
