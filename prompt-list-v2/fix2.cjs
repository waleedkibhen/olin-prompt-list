const fs = require('fs');

const perf = `import React from 'react';
import { Eye, Copy, Bookmark, Heart, Users, TrendingUp, TrendingDown, BarChart2, ExternalLink, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';
import styles from './dashboard.module.css';

interface PerformanceTabProps {
  stats: any;
  previousStats: any;
  followerCount: number;
  creatorPosts: any[];
  filteredPosts: any[];
  timeFilter: string;
  calculateTrend: (current: number, previous: number) => number | null;
  handleDeletePost: (id: string, title: string) => void;
}

export default function PerformanceTab({
  stats, previousStats, followerCount, creatorPosts, filteredPosts, timeFilter, calculateTrend, handleDeletePost
}: PerformanceTabProps) {
  const TrendIndicator = ({ trend }: { trend: number | null }) => {
    if (trend === null) {
      return (
        <div className={\`\${styles.trendTag}\`} style={{ color: 'var(--text-muted)' }}>
          <span>—</span>
        </div>
      );
    }
    let trendClass = '';
    if (trend >= 50) trendClass = styles.trendExcellent;
    else if (trend >= 0) trendClass = styles.trendGood;
    else if (trend >= -50) trendClass = styles.trendBad;
    else trendClass = styles.trendTerrible;
    const isPositive = trend >= 0;
    return (
      <div className={\`\${styles.trendTag} \${trendClass}\`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{Math.abs(trend)}%</span>
      </div>
    );
  };

  return (
    <>
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Eye size={18} className={styles.kpiIcon} />
            <span>Total Impressions</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{stats.views.toLocaleString()}</div>
            <TrendIndicator trend={calculateTrend(stats.views, previousStats.views)} />
          </div>
          <div className={styles.kpiDesc}>Across {filteredPosts.length} published pieces</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Copy size={18} className={styles.kpiIcon} />
            <span>Prompt Copies</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{stats.copies.toLocaleString()}</div>
            <TrendIndicator trend={calculateTrend(stats.copies, previousStats.copies)} />
          </div>
          <div className={styles.kpiDesc}>users copied your prompts</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Bookmark size={18} className={styles.kpiIcon} />
            <span>Saved Bookmarks</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{stats.saves.toLocaleString()}</div>
            <TrendIndicator trend={calculateTrend(stats.saves, previousStats.saves)} />
          </div>
          <div className={styles.kpiDesc}>Added to saved posts</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Heart size={18} className={styles.kpiIcon} />
            <span>Community Likes</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{stats.likes.toLocaleString()}</div>
            <TrendIndicator trend={calculateTrend(stats.likes, previousStats.likes)} />
          </div>
          <div className={styles.kpiDesc}>Positive engagement</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiTop}>
            <Users size={18} className={styles.kpiIcon} />
            <span>Followers</span>
          </div>
          <div className={styles.kpiValueRow}>
            <div className={styles.kpiValue}>{followerCount.toLocaleString()}</div>
            <TrendIndicator trend={calculateTrend(followerCount, 0)} />
          </div>
          <div className={styles.kpiDesc}>Following your updates</div>
        </div>
      </section>

      <div className={styles.tableHeader}>
        <h2 className={styles.sectionTitle}>
          Recent Uploads ({creatorPosts.length})
        </h2>
      </div>

      {filteredPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <BarChart2 size={48} className={styles.emptyIcon} />
          <h3>No artwork found for this timeframe</h3>
          <p>Try adjusting your time filter to see more data.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artwork &amp; Title</th>
                <th>Model &amp; Style</th>
                {ENABLE_MONETIZATION && <th>Pricing</th>}
                <th className={styles.textRight}>Views</th>
                <th className={styles.textRight}>Copies</th>
                <th className={styles.textRight}>Saves</th>
                <th className={styles.textRight}>Likes</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
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
                    <span className={styles.badgePill}>{post.model}</span>
                    <div className={styles.styleTag}>{post.styleTag}</div>
                  </td>
                  {ENABLE_MONETIZATION && (
                    <td>
                      {post.isPaid ? (
                        <span className={styles.paidBadge}>
                          ${post.price?.toLocaleString()}
                        </span>
                      ) : (
                        <span className={styles.freeBadge}>Free</span>
                      )}
                    </td>
                  )}
                  <td className={styles.metricCell}>{post.viewsCount.toLocaleString()}</td>
                  <td className={styles.metricCell}>
                    {post.copiesCount ? post.copiesCount.toLocaleString() : '0'}
                  </td>
                  <td className={styles.metricCell}>{post.savesCount.toLocaleString()}</td>
                  <td className={styles.metricCell}>{post.likesCount.toLocaleString()}</td>
                  <td className={styles.publishedDate}>{post.createdAt}</td>
                  <td>
                    <div className={styles.actionsCell}>
                      <Link 
                        to={\`/post/\${post.id}\`} 
                        className={styles.actionIconBtn} 
                        title="View standalone URL"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button 
                        className={\`\${styles.actionIconBtn} \${styles.deleteBtn}\`} 
                        onClick={() => handleDeletePost(post.id, post.title)}
                        title="Permanently delete post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}`;

fs.writeFileSync('src/pages/CreatorDashboard/PerformanceTab.tsx', perf);

const monetization = `import React from 'react';
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
            <div className={styles.kpiValue}>\${monetizationStats.totalRevenue.toFixed(2)}</div>
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
            <div className={styles.kpiValue}>\${monetizationStats.paidRevenue.toFixed(2)}</div>
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
            <div className={styles.kpiValue}>\${monetizationStats.adRevenue.toFixed(2)}</div>
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
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none' }}
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
                          Paid (\${post.price?.toFixed(2) || '1.99'})
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
                      {revenue !== null ? \`$\${revenue}\` : '-'}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link to={\`/post/\${post.id}\`} className={styles.actionIconBtn} title="View Post">
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
}`;

fs.writeFileSync('src/pages/CreatorDashboard/MonetizationTab.tsx', monetization);

const payout = `import React from 'react';
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
            <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>\${monetizationStats.totalRevenue.toFixed(2)}</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {monetizationStats.totalRevenue >= 5 
              ? "You have reached the minimum $5.00 threshold. Withdrawals are reviewed and processed at the end of the current month."
              : \`You need \${(5 - monetizationStats.totalRevenue).toFixed(2)} more to reach the $5.00 minimum withdrawal threshold.\`}
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
               'Recipient\\'s Wise Account Email'}
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
            style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.25rem', opacity: (isSubmittingPayout || !payoutDetails.trim() || monetizationStats.totalRevenue < 5 || !payoutAgreed) ? 0.5 : 1, cursor: (isSubmittingPayout || !payoutDetails.trim() || monetizationStats.totalRevenue < 5 || !payoutAgreed) ? 'not-allowed' : 'pointer' }}
          >
            {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </div>
  );
}`;

fs.writeFileSync('src/pages/CreatorDashboard/PayoutModal.tsx', payout);
console.log("Rewritten fully.");
