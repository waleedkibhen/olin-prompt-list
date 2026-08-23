import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Box, AlertTriangle, Sparkles, CheckCircle, Award, Users, TrendingUp, TrendingDown, Lock, PlayCircle, X, Info, DollarSign, MonitorPlay } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';
import toast from 'react-hot-toast';

export default function CreatorDashboardPage() {
  const { user, profile, updateProfileState, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [creatorPosts, setCreatorPosts] = useState<(PromptPost & { createdAtMs: number })[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [activeTab, setActiveTab] = useState<'performance' | 'monetization'>('performance');
  const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'paid' | 'ad'>('all');
  const [showMonetizationInfo, setShowMonetizationInfo] = useState(true); // '1d', '7d', '30d', '1y', 'all'
  const [postToDelete, setPostToDelete] = useState<{ id: string, title: string } | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingDb(false);
      return;
    }

    const fetchFollowers = async () => {
      try {
        const q = query(collection(db, 'follows'), where('followingId', '==', user.uid));
        const snap = await getDocs(q);
        setFollowerCount(snap.size);
      } catch (err) {
        console.error("Failed to fetch followers:", err);
      }
    };
    fetchFollowers();

    const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: (PromptPost & { createdAtMs: number })[] = [];
      let viewsSum = 0;
      let likesSum = 0;
      let savesSum = 0;
      let copiesSum = 0;
      let recentCopiesSum = 0;
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const views = d.viewsCount || 1;
        const likes = d.likesCount || 0;
        const saves = d.savesCount || 0;
        const copies = d.copiesCount || 0;
        const createdAtMs = d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now();

        if (createdAtMs >= ninetyDaysAgo) {
          recentCopiesSum += copies;
        }

        viewsSum += views;
        likesSum += likes;
        savesSum += saves;
        copiesSum += copies;

        items.push({
          id: docSnap.id,
          title: d.title || 'Untitled Creation',
          description: d.description || '',
          promptText: d.promptText || '',
          prompts: d.prompts || undefined,
          imageUrls: d.imageUrls || [],
          model: d.model || 'Midjourney V6',
          styleTag: d.styleTag || 'Community',
          categories: d.categories || [],
          creator: {
            uid: d.creatorId || user.uid,
            displayName: d.creatorDisplayName || user.displayName || 'Creator',
            username: d.creatorUsername || 'creator',
            avatarUrl: d.creatorAvatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: 0
          },
          likesCount: likes,
          savesCount: saves,
          viewsCount: views,
          copiesCount: copies,
          isPaid: d.isPaid || false,
          price: d.price || 0,
          monetizationType: d.monetizationType || (d.isPaid ? 'charge' : 'free'),
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Recently',
          createdAtMs
        });
      });

      items.sort((a, b) => b.viewsCount - a.viewsCount);
      setCreatorPosts(items);
      setLoadingDb(false);
    }, (err) => {
      console.error("Dashboard synchronization error:", err);
      setLoadingDb(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const filteredPosts = React.useMemo(() => {
    if (timeFilter === 'all') return creatorPosts;
    const now = Date.now();
    let limit = 0;
    if (timeFilter === '1d') limit = 1 * 24 * 60 * 60 * 1000;
    if (timeFilter === '7d') limit = 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30d') limit = 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === '1y') limit = 365 * 24 * 60 * 60 * 1000;
    return creatorPosts.filter(p => (now - p.createdAtMs) <= limit);
  }, [creatorPosts, timeFilter]);

  const previousFilteredPosts = React.useMemo(() => {
    if (timeFilter === 'all') return [];
    const now = Date.now();
    let limit = 0;
    if (timeFilter === '1d') limit = 1 * 24 * 60 * 60 * 1000;
    if (timeFilter === '7d') limit = 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30d') limit = 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === '1y') limit = 365 * 24 * 60 * 60 * 1000;
    return creatorPosts.filter(p => (now - p.createdAtMs) > limit && (now - p.createdAtMs) <= limit * 2);
  }, [creatorPosts, timeFilter]);

  const stats = React.useMemo(() => {
    return filteredPosts.reduce((acc, p) => ({
      views: acc.views + p.viewsCount,
      likes: acc.likes + p.likesCount,
      saves: acc.saves + p.savesCount,
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [filteredPosts]);

  const previousStats = React.useMemo(() => {
    return previousFilteredPosts.reduce((acc, p) => ({
      views: acc.views + p.viewsCount,
      likes: acc.likes + p.likesCount,
      saves: acc.saves + p.savesCount,
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [previousFilteredPosts]);

  const calculateTrend = (current: number, previous: number) => {
    if (timeFilter === 'all') {
      return current > 0 ? 100 : null;
    }
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
  };

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

  
  const monetizationPosts = React.useMemo(() => {
    return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported');
  }, [creatorPosts]);

  const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let adRevenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;

    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (p.monetizationType === 'ad_supported') {
        adRevenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
        adPosts++;
      }
    });
    return { 
      totalRevenue: paidRevenue + adRevenue, 
      paidRevenue, 
      adRevenue,
      paidUnlocks, 
      adUnlocks,
      paidPosts,
      adPosts
    };
  }, [monetizationPosts]);

  const displayMonetizationPosts = React.useMemo(() => {
    if (monetizationFilter === 'all') return monetizationPosts;
    if (monetizationFilter === 'paid') return monetizationPosts.filter(p => p.monetizationType === 'charge');
    if (monetizationFilter === 'ad') return monetizationPosts.filter(p => p.monetizationType === 'ad_supported');
    return monetizationPosts;
  }, [monetizationPosts, monetizationFilter]);


  const handleDeletePost = (postId: string, title: string) => {
    setPostToDelete({ id: postId, title });
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete.id));
      setPostToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete artwork: ${err.message}`);
    }
  };

  return (
    <main className={styles.container}>
            <header className={styles.header}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.title}>Creator Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your analytical performance and prompt monetization.
          </p>
          {user && (
            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tab} ${activeTab === 'performance' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'monetization' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('monetization')}
              >
                Monetization
              </button>
            </div>
          )}
        </div>
        {user && activeTab === 'performance' && (
          <div className={styles.timeFilterContainer} style={{ marginTop: '1rem' }}>
            <select 
              className={styles.timeSelect} 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}
      </header>

      {!user && !authLoading ? (
        <div className={styles.emptyState}>
          <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
          <h3>Google Authentication Required</h3>
          <p>To view your Creator Dashboard and analytical metrics, you must be logged in with your verified Google account.</p>
          <button className="btn-solid" onClick={signInWithGoogle}>
            Sign In with Google
          </button>
        </div>
      ) : loadingDb || authLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
          <Box size={40} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontWeight: 600 }}>Loading dashboard data...</span>
        </div>
      ) : (
        <>

          {activeTab === 'performance' ? (
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
          ) : (
            <>
              <section className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Sparkles size={18} className={styles.kpiIcon} style={{color: '#10b981'}} />
                    <span>Total Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>${monetizationStats.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Estimated overall earnings</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Lock size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />
                    <span>Paid Posts</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.paidPosts.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Charge-to-unlock prompts</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <DollarSign size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />
                    <span>Paid Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>${monetizationStats.paidRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Direct prompt sales</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <MonitorPlay size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />
                    <span>Ad Posts</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.adPosts.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Ad-supported prompts</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Eye size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />
                    <span>Ad Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>${monetizationStats.adRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Estimated monthly pool share</div>
                </div>
              </section>

              {showMonetizationInfo && (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                  <div style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>How Creator Monetization Works</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <li><strong>Paid Prompts:</strong> You earn directly when users buy your prompt via Whop (minus platform fees).</li>
                      <li><strong>Ad-Supported Prompts:</strong> Prompts stay 100% free for viewers. Revenue is pooled and calculated at the end of each month based on your share of global page views.</li>
                      <li><strong>Payouts:</strong> Minimum withdrawal threshold is <strong>$10.00</strong>.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setShowMonetizationInfo(false)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Dismiss"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className={styles.tableHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  Monetized Posts ({displayMonetizationPosts.length})
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '8px' }}>
                  <button 
                    onClick={() => setMonetizationFilter('all')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'all' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    All Monetized
                  </button>
                  <button 
                    onClick={() => setMonetizationFilter('paid')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'paid' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'paid' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    Paid Prompts
                  </button>
                  <button 
                    onClick={() => setMonetizationFilter('ad')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'ad' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'ad' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    Ad Prompts
                  </button>
                </div>
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
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Lock size={12} /> Paid (${post.price?.toFixed(2) || '1.99'})
                                </span>
                              ) : (
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <PlayCircle size={12} /> Ad Unlock
                                </span>
                              )}
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 600 }}>
                              {unlocks.toLocaleString()}
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>
                              {revenue !== null ? `$${revenue}` : '-'}
                            </td>
                            <td>
                              <div className={styles.actionButtons}>
                                <Link to={`/post/${post.id}`} className={styles.actionBtn} title="View Post">
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
          )}
</>
      )}

      {postToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Artwork</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete "{postToDelete.title}"? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setPostToDelete(null)}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
      </main>
  );
}
