import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import styles from './post.module.css';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { Sparkles, Heart, Bookmark, Copy, Check, Share2, MessageSquare, ArrowLeft, Loader2, Send, AlertCircle, PlayCircle, Flag } from 'lucide-react';
import { moderateText } from '@/lib/ai';
import { ENABLE_MONETIZATION } from '@/lib/config';
import ReportModal from '@/components/ReportModal';
import RichTextRenderer, { copyRichPrompt } from '@/components/RichTextRenderer';

interface CommentItem {
  id: string;
  uid: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState<PromptPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const postRef = doc(db, 'posts', id);
    
    updateDoc(postRef, { viewsCount: increment(1) }).catch(() => {});

    const unsubscribePost = onSnapshot(postRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setPost({
          id: snap.id,
          title: d.title || 'Untitled',
          description: d.description || '',
          promptText: d.promptText || '',
          imageUrls: d.imageUrls || [],
          model: d.model || 'Midjourney V6',
          styleTag: d.styleTag || 'Community',
          categories: d.categories || [],
          creator: {
            uid: d.creatorId || 'anonymous',
            displayName: d.creatorDisplayName || 'AI Creator',
            username: d.creatorUsername || 'creator',
            avatarUrl: d.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: d.creatorFollowers || 0
          },
          likesCount: d.likesCount || 0,
          savesCount: d.savesCount || 0,
          viewsCount: d.viewsCount || 1,
          copiesCount: d.copiesCount || 0,
          isPaid: d.isPaid || false,
          price: d.price || 0,
          monetizationType: d.monetizationType || (d.isPaid ? 'subscribers_only' : 'free'),
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Just now'
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading post:", err);
      setLoading(false);
    });

    const commentsQuery = query(collection(db, `posts/${id}/comments`), orderBy("createdAt", "asc"));
    const unsubscribeComments = onSnapshot(commentsQuery, (snap) => {
      const items: CommentItem[] = [];
      snap.forEach(docSnap => {
        const cData = docSnap.data();
        items.push({
          id: docSnap.id,
          uid: cData.uid || '',
          authorName: cData.authorName || 'User',
          authorAvatar: cData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: cData.text || '',
          createdAt: cData.createdAt?.toDate ? cData.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'
        });
      });
      setComments(items);
    }, () => {});

    return () => {
      unsubscribePost();
      unsubscribeComments();
    };
  }, [id]);

  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post?.monetizationType || (post?.isPaid ? 'subscribers_only' : 'free'));

  useEffect(() => {
    if (id) {
      const storageKey = user ? `unlocked_${user.uid}` : 'unlocked_guest';
      const unlockedArr = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const isOwner = Boolean(user && user.uid === post?.creator?.uid);
      const isFree = effectiveMonetization === 'free';

      let subUnlocked = false;
      if (user && effectiveMonetization === 'subscribers_only') {
        const subStatus = localStorage.getItem(`olin_subscription_${user.uid}`);
        if (
          subStatus === 'active' || 
          profile?.isPremium === true || 
          profile?.subscriptionStatus === 'active' ||
          localStorage.getItem('olin_recent_success') === 'true'
        ) {
          subUnlocked = true;
        }
      }

      setIsUnlocked(isFree || isOwner || subUnlocked || unlockedArr.includes(id));
    }
    if (id && user) {
      const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
      
      setIsSaved(savedArr.includes(id));
      setIsLiked(likedArr.includes(id));
      if (post?.creator?.uid) {
        setIsFollowing(followedArr.includes(post.creator.uid));
      }
    }
  }, [id, user, post, profile?.isPremium, profile?.subscriptionStatus, effectiveMonetization]);

  const requireAuth = (actionName: string): boolean => {
    if (!user) {
      alert(`Sign in with Google to ${actionName} this prompt!`);
      signInWithGoogle();
      return false;
    }
    return true;
  };

  const handleCopyPrompt = async () => {
    if (!post) return;
    await copyRichPrompt(post.promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);

    try {
      await updateDoc(doc(db, 'posts', post.id), { copiesCount: increment(1) });
    } catch (e) {
      console.error("Failed to increment copy analytics:", e);
    }
  };

  const handleWatchAdToUnlock = () => {
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      const storageKey = user ? `unlocked_${user.uid}` : 'unlocked_guest';
      const unlockedArr = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...unlockedArr, id]));
      setIsUnlocked(true);
      setPreviewPaywall(false);
      handleCopyPrompt();
    }, 2800);
  };

  const handleSubscribeToUnlock = () => {
    navigate('/pricing');
  };

  const handleShareLink = () => {
    const shareUrl = window.location.origin + "/post/" + id;
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  const handleToggleLike = async () => {
    if (!requireAuth("Like")) return;
    if (!post || !user) return;
    const nextVal = !isLiked;
    setIsLiked(nextVal);
    
    const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...likedArr, id] : likedArr.filter((item: string) => item !== id);
    localStorage.setItem(`likes_${user.uid}`, JSON.stringify(nextArr));

    await updateDoc(doc(db, 'posts', id), { likesCount: increment(nextVal ? 1 : -1) }).catch(() => {});
  };

  const handleToggleSave = async () => {
    if (!requireAuth("Save")) return;
    if (!post || !user) return;
    const nextVal = !isSaved;
    setIsSaved(nextVal);

    const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...savedArr, id] : savedArr.filter((item: string) => item !== id);
    localStorage.setItem(`saves_${user.uid}`, JSON.stringify(nextArr));

    await updateDoc(doc(db, 'posts', id), { savesCount: increment(nextVal ? 1 : -1) }).catch(() => {});
  };

  const handleToggleFollow = async () => {
    if (!requireAuth("Follow creator for")) return;
    if (!post || !user) return;
    const creatorUid = post.creator.uid;
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);

    const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...followedArr, creatorUid] : followedArr.filter((item: string) => item !== creatorUid);
    localStorage.setItem(`following_${user.uid}`, JSON.stringify(nextArr));
  };

  const handleReportPost = () => {
    if (!requireAuth("Report guideline violation on")) return;
    if (!post || !user) return;
    setIsReportModalOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth("Post a comment on")) return;
    if (!newComment.trim() || !user || !profile || !post) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const modResult = await moderateText(newComment.trim());
      if (!modResult.approved) {
        setIsSubmittingComment(false);
        setCommentError(modResult.reason || "Comment blocked by safety moderation.");
        return;
      }

      const commentsRef = collection(db, `posts/${post.id}/comments`);
      await addDoc(commentsRef, {
        uid: user.uid,
        authorName: profile.displayName || user.displayName || 'Creator',
        authorAvatar: profile.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });

      setNewComment('');
      setIsSubmittingComment(false);
    } catch (err: any) {
      console.error("Error submitting comment:", err);
      setIsSubmittingComment(false);
      setCommentError("Failed to submit comment. Please check Firestore Database rules.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingBox}>
        <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading artwork...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.loadingBox}>
        <AlertCircle size={48} style={{ color: '#f43f5e' }} />
        <h3>Post Not Found</h3>
        <p>The requested artwork ID does not exist or has been removed.</p>
        <Link to="/" className="btn-solid" style={{ marginTop: '1rem', textDecoration: 'none' }}>Return to Home Feed</Link>
      </div>
    );
  }

  const isCreator = Boolean(user && user.uid === post.creator.uid);
  const isProtected = Boolean(effectiveMonetization !== 'free' && (!isUnlocked || (isCreator && previewPaywall)));

  return (
    <div className={styles.pageContainer}>
        <div className={styles.navHeader}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={18} />
            <span>Back to Discovery Marketplace</span>
          </Link>
          <div className="badge-pill" style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
            <Sparkles size={14} />
            <span>Verified AI Creation</span>
          </div>
        </div>

        <main className={styles.mainGrid}>
          <section className={styles.imageColumn}>
            <div className={styles.mainImageCard}>
              <img src={post.imageUrls[activeImgIndex]} alt={post.title} className={styles.activeImg} />
            </div>

            {post.imageUrls.length > 1 && (
              <div className={styles.carouselThumbs}>
                {post.imageUrls.map((url, idx) => (
                  <button 
                    key={idx}
                    className={`${styles.thumbBtn} ${activeImgIndex === idx ? styles.thumbBtnActive : ''}`}
                    onClick={() => setActiveImgIndex(idx)}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} className={styles.thumbImg} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.detailsColumn}>
            <div className={styles.headerSection}>
              <div className={styles.creatorBanner}>
                <div className={styles.creatorLeft}>
                  <img src={post.creator.avatarUrl} alt={post.creator.displayName} className={styles.avatar} />
                  <div className={styles.creatorMeta}>
                    <span className={styles.creatorName}>{post.creator.displayName}</span>
                    <span className={styles.creatorHandle}>@{post.creator.username}</span>
                  </div>
                </div>
                {user?.uid !== post.creator.uid && (
                  <button 
                    className={isFollowing ? "btn-solid" : "btn-outline"} 
                    onClick={handleToggleFollow}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                  >
                    {isFollowing ? '✓ Following' : '+ Follow Creator'}
                  </button>
                )}
              </div>

              <h1 className={styles.postTitle}>{post.title}</h1>
              
              <div className={styles.badgeGroup}>
                <span className={styles.modelBadge}>{post.model}</span>
                <span className={styles.styleBadge}>{post.styleTag}</span>
                {effectiveMonetization === 'subscribers_only' ? (
                  <span className={styles.premiumBadge}>
                    💎 Subscriber Only
                  </span>
                ) : effectiveMonetization === 'ad_supported' ? (
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', fontSize: '0.78rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                    ▶️ Ad-Supported
                  </span>
                ) : (
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', fontSize: '0.78rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
                    🟢 Free (Open)
                  </span>
                )}
                {post.categories.map(cat => (
                  <span key={cat} className="badge-pill">#{cat}</span>
                ))}
              </div>

              {post.description && <p className={styles.descText}>{post.description}</p>}
            </div>

            <div className={styles.promptVault}>
              {isCreator && effectiveMonetization !== 'free' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.65rem 1rem', marginBottom: '0.5rem', fontSize: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700 }}>
                    <span>👑 Creator Access Enabled</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>— Users see the {effectiveMonetization === 'subscribers_only' ? 'Subscriber' : 'Ad Watch'} paywall</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPaywall(!previewPaywall)}
                    style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '6px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    {previewPaywall ? '👁️ Show Real Prompt' : '🔒 Preview Public Paywall'}
                  </button>
                </div>
              )}

              <div className={styles.vaultHeader}>
                <div className={styles.vaultTitle}>
                  <Sparkles size={16} />
                  <strong>{isProtected ? "Protected AI Prompt Parameters" : "Generative AI Prompt Text (V1 Unlocked)"}</strong>
                </div>
                {!isProtected && (
                  <button className={`btn-solid ${styles.copyBtn}`} onClick={handleCopyPrompt}>
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    <span>{isCopied ? 'Copied & Recorded!' : 'Copy Prompt'}</span>
                  </button>
                )}
              </div>

              {isWatchingAd ? (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '2px dashed #10b981', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                  <Loader2 size={44} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                  <strong style={{ fontSize: '1.25rem', color: '#10b981' }}>🍿 Playing Community Sponsor Message...</strong>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '420px' }}>
                    Thank you for supporting generative creators on Olin Prompt List! Prompt parameters unlocking in moments...
                  </span>
                </div>
              ) : isProtected ? (
                <div className={styles.blurredVaultContainer}>
                  <div className={styles.dummyBlurBackground} aria-hidden="true">
                    <code>
                      /imagine prompt: [PROTECTED OLIN VAULT] cinematic photographic masterpiece, hyperdetailed textures, 8k resolution, volumetric ambiance, studio lighting, dynamic contrast, masterwork seeds [UNLOCK TO REVEAL FULL GENERATIVE PARAMETERS &amp; STYLING WEIGHTS] --v 6.0 --ar 16:9 --style raw --s 750
                    </code>
                  </div>
                  <div className={styles.vaultOverlayContent}>
                    <div className={styles.lockBadgePill} style={effectiveMonetization === 'ad_supported' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981' } : {}}>
                      {effectiveMonetization === 'subscribers_only' ? '🔒 Subscriber Only Vault' : '▶️ Free Ad-Supported Vault'}
                    </div>
                    <h4 className={styles.lockTitle}>Protected AI Creation by @{post.creator.username}</h4>
                    <p className={styles.lockDesc}>
                      Full generative parameters, styling seeds, and camera weights are securely blurred and protected from inspection until unlocked.
                    </p>
                    {effectiveMonetization === 'subscribers_only' ? (
                      <button
                        className={styles.whopUnlockBtn}
                        onClick={handleSubscribeToUnlock}
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' }}
                      >
                        🔒 Subscribe to Unlock
                      </button>
                    ) : (
                      <button
                        className={styles.whopUnlockBtn}
                        onClick={handleWatchAdToUnlock}
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <PlayCircle size={18} />
                        <span>Watch an Ad to Unlock Prompt</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.promptText} style={{ padding: 0, overflow: 'hidden' }}>
                  <RichTextRenderer content={post.promptText} />
                </div>
              )}
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Total Views</span>
                <span className={styles.metaValue}>{post.viewsCount.toLocaleString()}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Prompt Copies</span>
                <span className={styles.metaValue}>{post.copiesCount ? post.copiesCount.toLocaleString() : '0'}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Published Date</span>
                <span className={styles.metaValue} style={{ fontSize: '0.95rem' }}>{post.createdAt}</span>
              </div>
            </div>

            <div className={styles.socialActionBar}>
              <button className={`${styles.actionBtn} ${isLiked ? styles.actionBtnLiked : ''}`} onClick={handleToggleLike}>
                <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                <span>{isLiked ? 'Liked' : 'Like'} ({post.likesCount})</span>
              </button>
              <button className={`${styles.actionBtn} ${isSaved ? styles.actionBtnSaved : ''}`} onClick={handleToggleSave}>
                <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                <span>{isSaved ? 'Saved to Library' : 'Save Bookmark'}</span>
              </button>
              <button className={styles.actionBtn} onClick={handleShareLink} style={isLinkCopied ? { color: '#10b981', borderColor: '#10b981' } : {}}>
                <Share2 size={18} />
                <span>{isLinkCopied ? 'Link Copied!' : 'Share URL'}</span>
              </button>
              <button className={styles.actionBtn} onClick={handleReportPost} style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }} title="Flag artwork for moderation review">
                <Flag size={18} />
                <span>Report</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={20} />
                <span>Community Discussions ({comments.length})</span>
              </h3>

              {commentError && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', borderRadius: 'var(--radius-sm)', color: '#f43f5e', fontSize: '0.85rem' }}>
                  <strong>Safety Violation / Error:</strong> {commentError}
                </div>
              )}

              <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input 
                  type="text"
                  placeholder={user ? "Add to the discussion..." : "Sign in with Google to post a comment..."}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                />
                <button type="submit" className="btn-solid" disabled={isSubmittingComment || !newComment.trim()} style={{ padding: '0.75rem 1.25rem' }}>
                  {isSubmittingComment ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)', fontStyle: 'italic', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    No comments yet. Be the first to start a conversation about this artwork!
                  </div>
                ) : (
                  comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <img src={c.authorAvatar} alt={c.authorName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.authorName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.createdAt}</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      {post && isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}
    </div>
  );
}
