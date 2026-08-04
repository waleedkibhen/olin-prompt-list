import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import { Link } from 'react-router-dom';

export default function CreatorDashboardPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [creatorPosts, setCreatorPosts] = useState<PromptPost[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [totalSaves, setTotalSaves] = useState(0);
  const [totalCopies, setTotalCopies] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingDb(false);
      return;
    }

    const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: PromptPost[] = [];
      let viewsSum = 0;
      let likesSum = 0;
      let savesSum = 0;
      let copiesSum = 0;

      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const views = d.viewsCount || 1;
        const likes = d.likesCount || 0;
        const saves = d.savesCount || 0;
        const copies = d.copiesCount || 0;

        viewsSum += views;
        likesSum += likes;
        savesSum += saves;
        copiesSum += copies;

        items.push({
          id: docSnap.id,
          title: d.title || 'Untitled Creation',
          description: d.description || '',
          promptText: d.promptText || '',
          negativePrompt: d.negativePrompt || null,
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
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Recently'
        });
      });

      items.sort((a, b) => b.viewsCount - a.viewsCount);
      setCreatorPosts(items);
      setTotalViews(viewsSum);
      setTotalLikes(likesSum);
      setTotalSaves(savesSum);
      setTotalCopies(copiesSum);
      setLoadingDb(false);
    }, (err) => {
      console.error("Dashboard synchronization error:", err);
      setLoadingDb(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleDeletePost = async (postId: string, title: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${title}" from the marketplace?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (err: any) {
      alert(`Failed to delete artwork: ${err.message}`);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <div className={styles.titleWrapper}>
            <BarChart2 size={28} className={styles.icon} />
            <h1 className={styles.title}>Creator Performance Dashboard</h1>
          </div>
          <p className={styles.subtitle}>
            Analyze real-time impressions, saves, likes, and generative prompt copy events across your published portfolio.
          </p>
        </div>

        {user && (
          <button className="btn-solid" onClick={() => setIsModalOpen(true)} style={{ padding: '0.75rem 1.5rem', fontWeight: 700 }}>
            <PlusCircle size={18} />
            <span>Upload New Artwork</span>
          </button>
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
                <span>Total Impressions</span>
                <Eye size={20} style={{ color: '#38bdf8' }} />
              </div>
              <div className={styles.kpiValue}>{totalViews.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Across {creatorPosts.length} published pieces</div>
            </div>

            <div className={styles.kpiCard} style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div className={styles.kpiTop}>
                <span style={{ color: '#10b981' }}>Prompt Copies</span>
                <Copy size={20} style={{ color: '#10b981' }} />
              </div>
              <div className={styles.kpiValue} style={{ color: '#10b981' }}>{totalCopies.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Times users copied your generative parameters</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span>Saved Bookmarks</span>
                <Bookmark size={20} style={{ color: 'var(--accent-color)' }} />
              </div>
              <div className={styles.kpiValue}>{totalSaves.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Added to user private reference libraries</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span>Community Likes</span>
                <Heart size={20} style={{ color: '#f43f5e' }} />
              </div>
              <div className={styles.kpiValue}>{totalLikes.toLocaleString()}</div>
              <div className={styles.kpiDesc}>Positive visual engagement score</div>
            </div>
          </section>

          <h2 className={styles.sectionTitle}>
            <Sparkles size={22} style={{ color: 'var(--accent-color)' }} />
            <span>Published Portfolio Management ({creatorPosts.length})</span>
          </h2>

          {creatorPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <BarChart2 size={48} className={styles.emptyIcon} />
              <h3>No uploaded artwork yet</h3>
              <p>Upload your AI artwork and prompts to start tracking user engagement and prompt copy analytics!</p>
              <button className="btn-solid" onClick={() => setIsModalOpen(true)}>
                Share Your First Prompt
              </button>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Artwork &amp; Title</th>
                    <th>Model &amp; Style</th>
                    <th>Pricing</th>
                    <th>Views</th>
                    <th style={{ color: '#10b981' }}>Copies</th>
                    <th>Saves</th>
                    <th>Likes</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {creatorPosts.map(post => (
                    <tr key={post.id}>
                      <td>
                        <div className={styles.postInfo}>
                          <img src={post.imageUrls[0]} alt={post.title} className={styles.postThumb} />
                          <div>
                            <span className={styles.postTitle}>{post.title}</span>
                            <span className={styles.postModel}>ID: {post.id.substring(0, 14)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-pill">{post.model}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{post.styleTag}</div>
                      </td>
                      <td>
                        {post.isPaid ? (
                          <span style={{ color: '#10b981', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'inline-block' }}>
                            💎 ${post.price?.toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>Free</span>
                        )}
                      </td>
                      <td className={styles.metricCell}>{post.viewsCount.toLocaleString()}</td>
                      <td className={styles.metricCell} style={{ color: '#10b981', fontWeight: 900 }}>
                        {post.copiesCount ? post.copiesCount.toLocaleString() : '0'}
                      </td>
                      <td className={styles.metricCell}>{post.savesCount.toLocaleString()}</td>
                      <td className={styles.metricCell}>{post.likesCount.toLocaleString()}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{post.createdAt}</td>
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

      {isModalOpen && (
        <CreatePostModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => alert("New artwork published! Your dashboard analytics are live!")} 
        />
      )}
    </main>
  );
}
