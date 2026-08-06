import React, { useState, useEffect } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Bookmark, Copy, Check, Sparkles, Share2, MessageSquare, ExternalLink, Send, Loader2, PlayCircle, ShieldCheck, Flag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';
import ReportModal from '@/components/ReportModal';
import RichTextRenderer, { copyRichPrompt } from '@/components/RichTextRenderer';

interface PromptCardProps {
  post: PromptPost;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
}

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export default function PromptCard({ post, onLike, onSave }: PromptCardProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [savesCount, setSavesCount] = useState(post.savesCount);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free'));

  useEffect(() => {
    const storageKey = user ? `unlocked_${user.uid}` : 'unlocked_guest';
    const unlockedArr = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const isOwner = Boolean(user && user.uid === post.creator?.uid);
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

    setIsUnlocked(isFree || isOwner || subUnlocked || unlockedArr.includes(post.id));

    if (user && profile) {
      const savedArr = profile.savedPosts || JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      const likedArr = profile.likedPosts || JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
      
      setIsSaved(savedArr.includes(post.id));
      setIsLiked(likedArr.includes(post.id));
      if (post.creator?.uid) {
        setIsFollowing(followedArr.includes(post.creator.uid));
      }
    } else if (user) {
      // Fallback for when profile is still loading but user exists
      const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
      setIsSaved(savedArr.includes(post.id));
      setIsLiked(likedArr.includes(post.id));
    }
  }, [user, profile, post.id, post.creator?.uid, post.isPaid, post.monetizationType, effectiveMonetization]);

  useEffect(() => {
    if (!isModalOpen) return;
    const commentsQuery = query(collection(db, `posts/${post.id}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(commentsQuery, (snap) => {
      const items: CommentItem[] = [];
      snap.forEach(docSnap => {
        const cData = docSnap.data();
        items.push({
          id: docSnap.id,
          authorName: cData.authorName || 'User',
          authorAvatar: cData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: cData.text || '',
          createdAt: cData.createdAt?.toDate ? cData.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'
        });
      });
      setComments(items);
    }, () => {});

    return () => unsubscribe();
  }, [isModalOpen, post.id]);

  const requireAuth = (_actionName: string): boolean => {
    if (!user) {
      alert(`Sign in to perform this action!`);
      signInWithGoogle();
      return false;
    }
    return true;
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("Like")) return;
    if (!user) return;

    const nextVal = !isLiked;
    setIsLiked(nextVal);
    setLikesCount(prev => nextVal ? prev + 1 : Math.max(0, prev - 1));

    // Fallback local storage for immediate responsiveness and offline support
    const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...likedArr, post.id] : likedArr.filter((item: string) => item !== post.id);
    localStorage.setItem(`likes_${user.uid}`, JSON.stringify(nextArr));

    if (onLike) onLike(post.id);
    
    // Cloud sync: update the post counts AND the user's profile array in Firestore
    const postUpdate = updateDoc(doc(db, 'posts', post.id), { likesCount: increment(nextVal ? 1 : -1) });
    const userUpdate = updateDoc(doc(db, 'users', user.uid), { 
      likedPosts: nextVal ? arrayUnion(post.id) : arrayRemove(post.id) 
    });
    await Promise.all([postUpdate, userUpdate]).catch(() => {});
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("Save")) return;
    if (!user) return;

    const nextVal = !isSaved;
    setIsSaved(nextVal);
    setSavesCount(prev => nextVal ? prev + 1 : Math.max(0, prev - 1));

    const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...savedArr, post.id] : savedArr.filter((item: string) => item !== post.id);
    localStorage.setItem(`saves_${user.uid}`, JSON.stringify(nextArr));

    if (onSave) onSave(post.id);
    
    const postUpdate = updateDoc(doc(db, 'posts', post.id), { savesCount: increment(nextVal ? 1 : -1) });
    const userUpdate = updateDoc(doc(db, 'users', user.uid), { 
      savedPosts: nextVal ? arrayUnion(post.id) : arrayRemove(post.id) 
    });
    await Promise.all([postUpdate, userUpdate]).catch(() => {});
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("Follow")) return;
    if (!user || !post.creator?.uid) return;

    const creatorUid = post.creator.uid;
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);

    const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...followedArr, creatorUid] : followedArr.filter((item: string) => item !== creatorUid);
    localStorage.setItem(`following_${user.uid}`, JSON.stringify(nextArr));
  };

  const handleCopyPrompt = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await copyRichPrompt(post.promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);

    try {
      await updateDoc(doc(db, 'posts', post.id), { copiesCount: increment(1) });
    } catch (err) {
      console.error("Failed to increment copy count:", err);
    }
  };

  const handleWatchAdToUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      const storageKey = user ? `unlocked_${user.uid}` : 'unlocked_guest';
      const unlockedArr = JSON.parse(localStorage.getItem(storageKey) || '[]');
      localStorage.setItem(storageKey, JSON.stringify([...unlockedArr, post.id]));
      setIsUnlocked(true);
      setPreviewPaywall(false);
      handleCopyPrompt();
    }, 2800);
  };

  const handleSubscribeToUnlock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate('/pricing');
  };

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + "/post/" + post.id;
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth("Comment")) return;
    if (!newComment.trim() || !user || !profile) return;

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const modResult = await moderateText(newComment.trim());
      if (!modResult.approved) {
        setIsSubmittingComment(false);
        setCommentError("Comment could not be published due to content safety guidelines.");
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
    } catch (_err: any) {
      setIsSubmittingComment(false);
      setCommentError("Failed to publish comment.");
    }
  };

  const handleReportPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("Please sign in with your Google account to report community guideline violations.");
      return;
    }
    setIsReportModalOpen(true);
  };

  const isCreator = Boolean(user && user.uid === post.creator.uid);
  const isProtected = Boolean(effectiveMonetization !== 'free' && (!isUnlocked || (isCreator && previewPaywall)));

  return (
    <>
      <article className={styles.cardContainer} onClick={() => setIsModalOpen(true)}>
        <div className={styles.imageWrapper}>
          <img 
            src={post.imageUrls[0]} 
            alt={post.title}
            className={styles.postImage}
            loading="lazy"
          />
          
          <div className={styles.overlay}>
            <div className={styles.topActions}>
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={styles.modelBadge}>
                  {post.model}
                </span>
                {effectiveMonetization === 'subscribers_only' ? (
                  <span className={styles.premiumBadge}>
                    💎 Subscriber Only
                  </span>
                ) : effectiveMonetization === 'ad_supported' ? (
                  <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                    ▶️ Ad-Supported
                  </span>
                ) : (
                  <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.85)', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                    🟢 Free
                  </span>
                )}
              </div>
              <div className={styles.actionBtns}>
                <button 
                  className={`${styles.actionIconBtn} ${isLiked ? styles.likedBtn : ''}`}
                  onClick={toggleLike}
                  title="Like artwork"
                >
                  <Heart size={15} fill={isLiked ? "currentColor" : "none"} />
                  <span>{likesCount}</span>
                </button>
                <button 
                  className={`${styles.actionIconBtn} ${isSaved ? styles.savedBtn : ''}`}
                  onClick={toggleSave}
                  title="Save bookmark"
                >
                  <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
                </button>
                <button 
                  className={styles.actionIconBtn}
                  onClick={handleReportPost}
                  title="Report or flag this artwork"
                  style={{ color: '#f43f5e' }}
                >
                  <Flag size={14} />
                </button>
              </div>
            </div>

            <div className={styles.bottomOverlay}>
              <div />
              {isProtected ? (
                effectiveMonetization === 'subscribers_only' ? (
                  <button 
                    className={styles.lockedCopyBtn}
                    onClick={handleSubscribeToUnlock}
                    title="Subscriber Only — Click to upgrade and unlock"
                  >
                    🔒 <span>Subscribe to Unlock</span>
                  </button>
                ) : (
                  <button 
                    className={styles.lockedCopyBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                    title="Ad Supported — Watch brief ad to unlock"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff' }}
                  >
                    ▶️ <span>Watch Ad to Unlock</span>
                  </button>
                )
              ) : (
                <button 
                  className={styles.quickCopyBtn}
                  onClick={handleCopyPrompt}
                  title="Copy generative parameters"
                >
                  {isCopied ? <Check size={13} className={styles.checkIcon} /> : <Copy size={13} />}
                  <span>{isCopied ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.cardCaption}>
          <span className={styles.captionTitle}>{post.title}</span>
          <div className={styles.creatorTiny}>
            <img src={post.creator.avatarUrl} alt={post.creator.displayName} className={styles.avatarTiny} />
            <span className={styles.creatorNameTiny}>{post.creator.displayName}</span>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            
            <div className={styles.modalImageSection}>
              <img 
                src={post.imageUrls[activeImageIndex]} 
                alt={post.title} 
                className={styles.modalMainImage} 
              />
              {post.imageUrls.length > 1 && (
                <div className={styles.carouselThumbs}>
                  {post.imageUrls.map((url, idx) => (
                    <button 
                      key={idx} 
                      className={`${styles.thumbBtn} ${activeImageIndex === idx ? styles.activeThumb : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                    >
                      <img src={url} alt={`Thumb ${idx + 1}`} className={styles.thumbImage} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalContentSection}>
              <div className={styles.modalHeader}>
                <div className={styles.creatorProfileModal}>
                  <img src={post.creator.avatarUrl} alt={post.creator.displayName} className={styles.avatarModal} />
                  <div>
                    <h4 className={styles.creatorNameModal}>{post.creator.displayName}</h4>
                    <span className={styles.creatorHandleModal}>@{post.creator.username}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {user?.uid !== post.creator.uid && (
                    <button 
                      className={isFollowing ? "btn-solid" : "btn-outline"} 
                      onClick={toggleFollow}
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', borderRadius: '9999px' }}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  )}
                  <Link 
                    to={`/post/${post.id}`} 
                    className="btn-outline" 
                    title="Open standalone post URL" 
                    onClick={() => setIsModalOpen(false)}
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderRadius: '9999px', textDecoration: 'none' }}
                  >
                    <ExternalLink size={13} />
                    <span>View</span>
                  </Link>
                </div>
              </div>

              <div className={styles.modalTitleArea}>
                <h2 className={styles.modalTitle}>{post.title}</h2>
                <div className={styles.tagGroup}>
                  <span className={styles.modelBadgeModal}>{post.model}</span>
                  <span className={styles.styleBadgeModal}>{post.styleTag}</span>
                  {effectiveMonetization === 'subscribers_only' ? (
                    <span className={styles.modalPriceBadge}>
                      💎 Premium (Subscribers Only)
                    </span>
                  ) : effectiveMonetization === 'ad_supported' ? (
                    <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b981', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                      ▶️ Ad-Supported
                    </span>
                  ) : (
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid #3b82f6', fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                      🟢 Free (Open)
                    </span>
                  )}
                  {post.categories.map(cat => (
                    <span key={cat} className={styles.catPill}>#{cat}</span>
                  ))}
                </div>
                {post.description && <p className={styles.modalDesc}>{post.description}</p>}
              </div>

              <div className={styles.promptVaultBox}>
                {isCreator && effectiveMonetization !== 'free' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.85rem', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700 }}>
                      <span>👑 Creator Access Enabled</span>
                      <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>— Users see the {effectiveMonetization === 'subscribers_only' ? 'Subscriber' : 'Ad Watch'} paywall</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreviewPaywall(!previewPaywall); }}
                      style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      {previewPaywall ? '👁️ Show Real Prompt' : '🔒 Preview Public Paywall'}
                    </button>
                  </div>
                )}

                <div className={styles.vaultHeader}>
                  <div className={styles.vaultTitle}>
                    <Sparkles size={15} />
                    <strong>{isProtected ? "Protected AI Prompt Parameters" : "AI Prompt Parameters"}</strong>
                  </div>
                  {!isProtected && (
                    <button 
                      className={`btn-solid ${styles.copyVaultBtn}`} 
                      onClick={handleCopyPrompt}
                    >
                      {isCopied ? <Check size={14} /> : <Copy size={14} />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
                
                {isWatchingAd ? (
                  <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', border: '2px dashed #10b981', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                    <Loader2 size={38} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                    <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>🍿 Playing Community Sponsor Message...</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
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
                      <h5 className={styles.lockTitle}>Protected AI Creation by @{post.creator.username}</h5>
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
                  <div className={styles.promptTextContainer} style={{ padding: 0 }}>
                    <RichTextRenderer content={post.promptText} className={styles.promptCode} />
                  </div>
                )}
              </div>

              <div className={styles.modalActionBar}>
                <button className={`${styles.barBtn} ${isLiked ? styles.barBtnActive : ''}`} onClick={toggleLike}>
                  <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
                  <span>{likesCount}</span>
                </button>
                <button className={`${styles.barBtn} ${isSaved ? styles.barBtnActive : ''}`} onClick={toggleSave}>
                  <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
                  <span>{savesCount}</span>
                </button>
                <button className={`${styles.barBtn} ${showComments ? styles.barBtnActive : ''}`} onClick={() => setShowComments(!showComments)}>
                  <MessageSquare size={17} />
                  <span>{comments.length} Comments</span>
                </button>
                <button className={styles.barBtn} onClick={handleShareLink} style={isLinkCopied ? { color: '#10b981', borderColor: '#10b981' } : {}}>
                  <Share2 size={17} />
                  <span>{isLinkCopied ? 'Copied' : 'Share'}</span>
                </button>
                <button className={styles.barBtn} onClick={handleReportPost} style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }} title="Report guidelines violation">
                  <Flag size={17} />
                  <span>Report</span>
                </button>
              </div>

              {showComments && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Discussion</h5>
                  
                  {commentError && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(244,63,94,0.1)', color: '#f43f5e', borderRadius: '6px', fontSize: '0.8rem' }}>
                      {commentError}
                    </div>
                  )}

                  <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder={user ? "Write a comment..." : "Sign in to comment..."} 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      disabled={isSubmittingComment}
                      style={{ flex: 1, padding: '0.5rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
                    />
                    <button type="submit" className="btn-solid" disabled={isSubmittingComment || !newComment.trim()} style={{ padding: '0.5rem 1rem', borderRadius: '9999px' }}>
                      {isSubmittingComment ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                    </button>
                  </form>

                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {comments.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No comments yet.</span>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <img src={c.authorAvatar} alt={c.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{c.authorName}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.createdAt}</span>
                            </div>
                            <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{c.text}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className={styles.modalCloseFooter}>
                <button className="btn-outline" onClick={() => setIsModalOpen(false)} style={{ width: '100%', borderRadius: '9999px' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}
    </>
  );
}
