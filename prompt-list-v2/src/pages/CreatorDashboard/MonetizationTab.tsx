import React from 'react';
import { DollarSign, Lock, MonitorPlay, Eye, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './dashboard.module.css';

interface MonetizationTabProps {
  monetizationStats: any;
  displayMonetizationPosts: any[];
  setIsPayoutModalOpen: (open: boolean) => void;
  setIsMonetizationModalOpen: (open: boolean) => void;
  monetizationFilter: string;
}

export default function MonetizationTab({
  monetizationStats, displayMonetizationPosts, setIsPayoutModalOpen, setIsMonetizationModalOpen, monetizationFilter
}: MonetizationTabProps) {
  return (
    <>
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <DollarSign size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Total Revenue</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>${monetizationStats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className={styles.kpiDesc}>Estimated overall earnings</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Lock size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Paid Posts</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{monetizationStats.paidPosts.toLocaleString()}</div>
          </div>
          <div className={styles.kpiDesc}>Charge-to-unlock prompts</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <DollarSign size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Paid Revenue</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>${monetizationStats.paidRevenue.toFixed(2)}</div>
          </div>
          <div className={styles.kpiDesc}>Direct prompt sales</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <MonitorPlay size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Ad Posts</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{monetizationStats.adPosts.toLocaleString()}</div>
          </div>
          <div className={styles.kpiDesc}>Ad-supported prompts</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Eye size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />
            <span>Ad Revenue</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>${monetizationStats.adRevenue.toFixed(2)}</div>
          </div>
          <div className={styles.kpiDesc}>Estimated monthly pool share</div>
        </div>
      </section>

      {monetizationStats.isAdRevenuePending && (
        <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
          <div style={{ color: '#eab308', flexShrink: 0, marginTop: '0.25rem' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Ad Revenue Pending</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Your ad earnings will appear once you reach a total of 1,000 views. Current views: {monetizationStats.adViews.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
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
          <h3>No artwork found</h3>
          <p>Try adjusting your filter or setting up a monetized prompt.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artwork &amp; Title</th>
                <th>Monetization</th>
                <th className={styles.textRight}>
                  {monetizationFilter === 'paid' ? 'Purchases' : monetizationFilter === 'ad' ? 'Views' : 'Unlocks / Views'}
                </th>
                <th className={styles.textRight}>Revenue Earned</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayMonetizationPosts.map(post => {
                const isPaid = post.monetizationType === 'charge';
                const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
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
                          Ad-Supported
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
