import React, { useState, useEffect } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Bookmark, Copy, Check, Sparkles, Share2, MessageSquare, ExternalLink, Send, Loader2 } from 'lucide-react';
import { moderateText } from '@/lib/ai';
import { Link } from 'react-router-dom';

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

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [savesCount, setSavesCount] = useState(post.savesCount);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
      
      setIsSaved(savedArr.includes(post.id));
      setIsLiked(likedArr.includes(post.id));
      if (post.creator?.uid) {
        setIsFollowing(followedArr.includes(post.creator.uid));
      }
    }
  }, [user, post.id, post.creator?.uid]);

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

    const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...likedArr, post.id] : likedArr.filter((item: string) => item !== post.id);
    localStorage.setItem(`likes_${user.uid}`, JSON.stringify(nextArr));

    if (onLike) onLike(post.id);
    await updateDoc(doc(db, 'posts', post.id), { likesCount: increment(nextVal ? 1 : -1) }).catch(() => {});
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
    await updateDoc(doc(db, 'posts', post.id), { savesCount: increment(nextVal ? 1 : -1) }).catch(() => {});
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

  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(post.promptText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);

    try {
      await updateDoc(doc(db, 'posts', post.id), { copiesCount: increment(1) });
    } catch (err) {
      console.error("Failed to increment copy count:", err);
    }
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

  const isProtected = Boolean(post.isPaid && user?.uid !== post.creator.uid);

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
                {post.isPaid && (
                  <span className={styles.premiumBadge}>
                    💎 ${post.price?.toLocaleString()}
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
              </div>
            </div>

            <div className={styles.bottomOverlay}>
              <div />
              {isProtected ? (
                <button 
                  className={styles.lockedCopyBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`To view and copy this generative prompt, unlock it via WHOP for $${post.price?.toLocaleString()}. (Open post details to initiate checkout)`);
                  }}
                  title="Locked Premium Artwork"
                >
                  🔒 <span>${post.price?.toLocaleString()}</span>
                </button>
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
                  {post.isPaid && (
                    <span className={styles.modalPriceBadge}>
                      💎 Premium (${post.price?.toLocaleString()})
                    </span>
                  )}
                  {post.categories.map(cat => (
                    <span key={cat} className={styles.catPill}>#{cat}</span>
                  ))}
                </div>
                {post.description && <p className={styles.modalDesc}>{post.description}</p>}
              </div>

              <div className={styles.promptVaultBox}>
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
                
                {isProtected ? (
                  <div className={styles.lockedVaultContainer}>
                    <div className={styles.lockIconBox}>🔒</div>
                    <h5 className={styles.lockTitle}>This Prompt is Monetized by @{post.creator.username}</h5>
                    <p className={styles.lockDesc}>
                      Unlock immediate access to full generative parameters, seeds, and styling weights.
                    </p>
                    <button
                      className={styles.whopUnlockBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`⚡ Connecting to WHOP Checkout Gateway for $${post.price?.toLocaleString()} USD...\n\n(Frontend preparation complete; WHOP transaction handling will finalize here)`);
                      }}
                    >
                      ⚡ Unlock via WHOP — ${post.price?.toLocaleString()}
                    </button>
                  </div>
                ) : (
                  <div className={styles.promptTextContainer}>
                    <code className={styles.promptCode}>{post.promptText}</code>
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
    </>
  );
}
