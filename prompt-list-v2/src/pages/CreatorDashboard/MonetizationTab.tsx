import React from 'react';
import { DollarSign, Lock, Eye, AlertTriangle, ExternalLink, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './dashboard.module.css';

interface MonetizationTabProps {
  monetizationStats: any;
  displayMonetizationPosts: any[];
  setIsPayoutModalOpen: (open: boolean) => void;
  setIsMonetizationModalOpen: (open: boolean) => void;
}

export default function MonetizationTab({
  monetizationStats, displayMonetizationPosts, setIsPayoutModalOpen, setIsMonetizationModalOpen
}: MonetizationTabProps) {
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
