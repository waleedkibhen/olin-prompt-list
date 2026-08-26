import React from 'react';
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
        <div className={`${styles.trendTag}`} style={{ color: 'var(--text-muted)' }}>
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
      <div className={`${styles.trendTag} ${trendClass}`}>
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
                        to={`/post/${post.id}`} 
                        className={styles.actionIconBtn} 
                        title="View standalone URL"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button 
                        className={`${styles.actionIconBtn} ${styles.deleteBtn}`} 
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
}
