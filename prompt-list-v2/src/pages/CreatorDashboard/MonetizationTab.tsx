import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { DollarSign, Lock, Eye, AlertTriangle, ExternalLink, BadgeCheck, Loader2, Crown, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';

interface MonetizationTabProps {
  monetizationStats: any;
  displayMonetizationPosts: any[];
  setIsPayoutModalOpen: (open: boolean) => void;
  setIsMonetizationModalOpen: (open: boolean) => void;
  subscriberPostCount: number;
}

export default function MonetizationTab({
  monetizationStats, displayMonetizationPosts, setIsPayoutModalOpen, setIsMonetizationModalOpen, subscriberPostCount
}: MonetizationTabProps) {
  const { user, profile, updateProfileState } = useAuth();
  const plan = (profile as any)?.subscriptionPlan;
  const legacy = (profile as any)?.subscriptionSettings;

  const [subEnabled, setSubEnabled] = useState<boolean>(plan?.enabled ?? legacy?.enabled ?? false);
  const [subMonthlyPrice, setSubMonthlyPrice] = useState<string>(plan?.monthlyPrice != null ? String(plan.monthlyPrice) : (legacy?.monthlyPrice != null ? String(legacy.monthlyPrice) : ''));
  const [subYearlyPrice, setSubYearlyPrice] = useState<string>(plan?.yearlyPrice != null ? String(plan.yearlyPrice) : '');
  const [subBenefits, setSubBenefits] = useState<string>(plan?.benefits?.join('\n') ?? legacy?.description ?? '');
  const [isSavingSub, setIsSavingSub] = useState(false);

  useEffect(() => {
    if (plan) {
      setSubEnabled(plan.enabled ?? false);
      setSubMonthlyPrice(plan.monthlyPrice != null ? String(plan.monthlyPrice) : '');
      setSubYearlyPrice(plan.yearlyPrice != null ? String(plan.yearlyPrice) : '');
      setSubBenefits(plan.benefits?.join('\n') ?? '');
    }
    // Intentional hydration: re-seed form fields whenever saved settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid, JSON.stringify(plan ?? null)]);

  const handleSaveSubscription = async () => {
    if (!user) return;
    const monthlyPrice = parseFloat(subMonthlyPrice) || 0;
    const yearlyPrice = parseFloat(subYearlyPrice) || 0;
    if (subEnabled && monthlyPrice <= 0) {
      toast.error('Set a monthly price for your membership.');
      return;
    }
    if (subEnabled && yearlyPrice > 0 === false && subYearlyPrice.trim() !== '') {
      toast.error('Yearly price must be greater than $0, or left empty.');
      return;
    }
    setIsSavingSub(true);
    try {
      // Whop auto-provisions the renewal plans for this creator
      const provRes = await fetch('/api/whop/provision-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          monthlyPrice,
          yearlyPrice,
          creatorName: profile?.displayName || profile?.username || 'Olin Creator'
        })
      });
      const provData = await provRes.json();
      if (!provRes.ok || !provData.success) {
        if (provData.code === 'products_permission_missing') {
          throw new Error('Whop key needs the products permission: Whop Dashboard → Developer → API keys → enable Products, then save again.');
        }
        throw new Error(provData.error || 'Failed to provision Whop membership plans');
      }

      const settings = {
        enabled: subEnabled,
        monthlyPrice,
        yearlyPrice,
        benefits: subBenefits.split('\n').map(b => b.trim()).filter(Boolean),
        whopMonthlyPlanId: provData.whopMonthlyPlanId,
        whopYearlyPlanId: provData.whopYearlyPlanId || ''
      };
      await updateDoc(doc(db, 'users', user.uid), { subscriptionPlan: settings });
      await updateProfileState({ subscriptionPlan: settings } as any);
      toast.success(subEnabled ? 'Creator Membership plan saved & Whop plans provisioned!' : 'Membership plan saved (disabled).');
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setIsSavingSub(false);
    }
  };

  return (
    <>
      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '1.1rem 1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <BadgeCheck size={22} style={{ color: '#10b981', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>0% Platform Fee — You keep 100% of your earnings.</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Earn through Direct Prompt Purchases ($1–$50) and Monthly Creator Subscriptions.
          </div>
        </div>
      </div>

      {/* Creator Membership Plan configuration */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.35rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>
            <Crown size={18} style={{ color: '#eab308' }} /> Creator Membership Plan
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={subEnabled}
              onChange={(e) => setSubEnabled(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
            Enable Subscriptions
          </label>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '8px', padding: '0.45rem 0.8rem', marginBottom: '1.1rem', fontSize: '0.85rem' }}>
          <Zap size={14} style={{ color: '#3b82f6' }} />
          <span>Membership currently includes <strong>{subscriberPostCount}</strong> subscriber-only prompt{subscriberPostCount === 1 ? '' : 's'} (auto-counted)</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Monthly Price (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={subMonthlyPrice}
                onChange={(e) => setSubMonthlyPrice(e.target.value)}
                placeholder="4.99"
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 1.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Yearly Price (USD) — optional</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={subYearlyPrice}
                onChange={(e) => setSubYearlyPrice(e.target.value)}
                placeholder="49.99"
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 1.7rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Member Benefits (one per line)</label>
            <textarea
              value={subBenefits}
              onChange={(e) => setSubBenefits(e.target.value)}
              rows={3}
              placeholder={'Early drop access\nFull prompt license\nAccess to all subscriber-only prompts'}
              style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }}
            />
          </div>
        </div>

        <button className="btn-solid" onClick={handleSaveSubscription} disabled={isSavingSub} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {isSavingSub ? <Loader2 size={14} className="spin" /> : null}
          {isSavingSub ? 'Saving...' : 'Save Membership Plan'}
        </button>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
          Whop renewal plans are provisioned automatically when you save. Subscribers unlock all your Subscriber-Only prompts while their membership is active.
        </div>
      </div>

      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <DollarSign size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Total Revenue</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>${monetizationStats.paidRevenue.toFixed(2)}</div>
          </div>
          <div className={styles.kpiDesc}>Direct prompt sales, 100% yours</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Eye size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Purchases</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{monetizationStats.paidUnlocks.toLocaleString()}</div>
          </div>
          <div className={styles.kpiDesc}>Prompt copies unlocked</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Lock size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Paid Posts</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{monetizationStats.paidPosts.toLocaleString()}</div>
          </div>
          <div className={styles.kpiDesc}>Pay-to-unlock prompts</div>
        </div>
      </section>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className="btn-solid" 
          onClick={() => setIsPayoutModalOpen(true)}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
        >
          <DollarSign size={16} /> Request Payout
        </button>
        <button 
          onClick={() => setIsMonetizationModalOpen(true)}
          style={{ 
            color: 'var(--text-secondary)', 
            textDecoration: 'underline', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: '0.95rem', 
            padding: 0,
            fontWeight: 500
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          How Creator Monetization Works
        </button>
      </div>

      <div className={styles.tableHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
          Monetized Posts ({displayMonetizationPosts.length})
        </h2>
      </div>

      {displayMonetizationPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <AlertTriangle size={48} className={styles.emptyIcon} />
          <h3>No monetized artwork found</h3>
          <p>Publish a post and choose Paid or Subscriber Only access to start earning.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artwork &amp; Title</th>
                <th>Access Tier</th>
                <th className={styles.textRight}>Purchases</th>
                <th className={styles.textRight}>Revenue Earned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayMonetizationPosts.map(post => {
                const isPaid = post.monetizationType === 'charge';
                const unlocks = post.copiesCount || 0;
                const revenue = isPaid 
                  ? (unlocks * (post.price || 1.99)).toFixed(2) 
                  : null;
                
                return (
                  <tr key={post.id}>
                    <td>
                      <div className={styles.postInfo}>
                        <div className={styles.postThumbWrapper}>
                          <img src={post.imageUrls[0]} alt={post.title} className={styles.postThumb} />
                        </div>
                        <div>
                          <span className={styles.postTitle}>{post.title}</span>
                          <span className={styles.postModel}>ID: {post.id.substring(0, 14)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {isPaid ? (
                        <span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                          Paid (${post.price?.toFixed(2) || '1.99'})
                        </span>
                      ) : (
                        <span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                          Subscriber Only
                        </span>
                      )}
                    </td>
                    <td className={styles.textRight} style={{ fontWeight: 600 }}>
                      {unlocks.toLocaleString()}
                    </td>
                    <td className={styles.textRight} style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {revenue !== null ? `$${revenue}` : '-'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link to={`/post/${post.id}`} className={styles.actionIconBtn} title="View Post">
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
