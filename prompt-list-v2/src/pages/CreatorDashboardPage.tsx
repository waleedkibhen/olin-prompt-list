import React, { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, where, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Loader2, AlertTriangle, Sparkles, CheckCircle, Award } from 'lucide-react';
import CreatePostModal from '@/components/CreatePostModal';
import { Link } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';

export default function CreatorDashboardPage() {
  const { user, profile, updateProfileState, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [creatorPosts, setCreatorPosts] = useState<PromptPost[]>([]);
  const [recentCopies, setRecentCopies] = useState(0);
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
      setRecentCopies(recentCopiesSum);
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
          {ENABLE_MONETIZATION ? (
            <section style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              marginBottom: '2rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Award size={32} style={{ color: '#f59e0b' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Creator Subscription &amp; Ad Monetization Funnel</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Achieve 50+ generative prompt copies in the last 90 days to unlock Premium subscriber-only prompt vaults.
                    </span>
                  </div>
                </div>
                <div>
                  {profile?.monetizationStatus === 'approved' && (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #10b981' }}>
                      <CheckCircle size={16} /> Approved Verified Creator
                    </span>
                  )}
                  {profile?.monetizationStatus === 'pending_review' && (
                    <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 700, border: '1px solid #f59e0b' }}>
                      ⏳ Under Admin Review
                    </span>
                  )}
                  {profile?.monetizationStatus === 'rejected' && (
                    <span style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 700, border: '1px solid #f43f5e' }}>
                      ❌ Application Rejected — Reach out via Support
                    </span>
                  )}
                </div>
              </div>

              {(!profile?.monetizationStatus || profile.monetizationStatus === 'ineligible') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                    <span>Milestone Progress (Last 90 Days)</span>
                    <span style={{ color: '#10b981' }}>{Math.min(recentCopies, 50)} / 50 Copies to Unlock Monetization</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ 
                      width: `${Math.min((recentCopies / 50) * 100, 100)}%`, 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', 
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease' 
                    }} />
                  </div>

                  {recentCopies >= 50 ? (
                    <button
                      type="button"
                      className="btn-solid"
                      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', fontWeight: 800, padding: '0.65rem 1.5rem', borderRadius: '9999px' }}
                      onClick={async () => {
                        try {
                          await updateProfileState({ monetizationStatus: 'pending_review' });
                          alert("Application submitted! Our Admin team will review your account analytics and copy verification.");
                        } catch (e: any) {
                          alert(`Application error: ${e.message}`);
                        }
                      }}
                    >
                      🚀 Apply for Monetization
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Share high-quality visual prompts in community feeds to generate more copy events!
                    </span>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px dashed #f59e0b', 
              borderRadius: '16px', 
              padding: '1.5rem', 
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(0,0,0,0.15))',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex' }}>
                  <Sparkles size={28} style={{ color: '#f59e0b' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Creator Monetization Program</h3>
                    <span style={{ backgroundColor: '#f59e0b', color: '#000', fontSize: '0.72rem', fontWeight: 900, padding: '2px 9px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      🚀 Coming Soon
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    We are engineering an exclusive Creator Monetization program where active contributors will be able to earn income from their published AI parameter portfolios and subscriber vaults! Stay tuned — monetization unlocks will be arriving soon as our creator ecosystem expands. Keep sharing high-quality prompts and building your audience!
                  </p>
                </div>
              </div>
            </section>
          )}

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
                    {ENABLE_MONETIZATION && <th>Pricing</th>}
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
                      {ENABLE_MONETIZATION && (
                        <td>
                          {post.isPaid ? (
                            <span style={{ color: '#10b981', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.8rem', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'inline-block' }}>
                              💎 ${post.price?.toLocaleString()}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.825rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>Free</span>
                          )}
                        </td>
                      )}
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
