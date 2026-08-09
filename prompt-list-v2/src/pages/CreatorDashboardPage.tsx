import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Loader2, AlertTriangle, Sparkles, CheckCircle, Award, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';

export default function CreatorDashboardPage() {
  const { user, profile, updateProfileState, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [creatorPosts, setCreatorPosts] = useState<(PromptPost & { createdAtMs: number })[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d'); // '1d', '7d', '30d', '1y', 'all'
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

  const stats = React.useMemo(() => {
    return filteredPosts.reduce((acc, p) => ({
      views: acc.views + p.viewsCount,
      likes: acc.likes + p.likesCount,
      saves: acc.saves + p.savesCount,
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [filteredPosts]);

  const handleDeletePost = (postId: string, title: string) => {
    setPostToDelete({ id: postId, title });
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete.id));
      setPostToDelete(null);
    } catch (err: any) {
      alert(`Failed to delete artwork: ${err.message}`);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.title}>Creator Performance Dashboard</h1>
          <p className={styles.subtitle}>
            Analyze real-time impressions, saves, likes, and generative prompt copy events across your published portfolio.
          </p>
          {user && (
            <div className={styles.timeFilterContainer}>
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
        </div>
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
        <div className={styles.emptyState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <h3>Calculating portfolio analytics...</h3>
          <p>Aggregating views, likes, and copy events from live Firestore database.</p>
        </div>
      ) : (
        <>

          <section className={styles.kpiGrid}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <Eye size={18} className={styles.kpiIcon} />
                <span>Total Impressions</span>
              </div>
              <div className={styles.kpiValue}>{stats.views.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Across {filteredPosts.length} published pieces</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <Copy size={18} className={styles.kpiIcon} />
                <span>Prompt Copies</span>
              </div>
              <div className={styles.kpiValue}>{stats.copies.toLocaleString()}</div>
              <div className={styles.kpiDesc}>users copied your prompts</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <Bookmark size={18} className={styles.kpiIcon} />
                <span>Saved Bookmarks</span>
              </div>
              <div className={styles.kpiValue}>{stats.saves.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Added to saved posts</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <Heart size={18} className={styles.kpiIcon} />
                <span>Community Likes</span>
              </div>
              <div className={styles.kpiValue}>{stats.likes.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Positive engagement</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <Users size={18} className={styles.kpiIcon} />
                <span>Followers</span>
              </div>
              <div className={styles.kpiValue}>{followerCount.toLocaleString()}</div>
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
