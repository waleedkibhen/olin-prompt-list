import React, { useState, useEffect, useRef } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, increment, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Bookmark, Copy, Check, Sparkles, Share2, MessageSquare, MessageCircle, ExternalLink, Send, Loader2, PlayCircle, ShieldCheck, Flag, ThumbsUp, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { moderateText } from '@/lib/ai';
import { ENABLE_MONETIZATION } from '@/lib/config';
import ReportModal from '@/components/ReportModal';
import RichTextRenderer, { copyRichPrompt } from '@/components/RichTextRenderer';

interface PromptCardProps {
  post: PromptPost;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  defaultOpen?: boolean;
  onCloseOverride?: () => void;
}

interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  replyCount: number;
  parentId?: string;
}

export default function PromptCard({ post, onLike, onSave, defaultOpen = false, onCloseOverride }: PromptCardProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const commentsRef = useRef<HTMLDivElement>(null);

  const scrollToComments = () => {
    setShowComments(true);
    setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleCommentsContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToComments();
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToComments();
  };

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [savesCount, setSavesCount] = useState(post.savesCount);
  
  const [isModalOpen, setIsModalOpen] = useState(defaultOpen);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'description'>('prompt');
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [commentToReport, setCommentToReport] = useState<string | null>(null);

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
          createdAt: cData.createdAt?.toDate ? cData.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now',
          likesCount: cData.likesCount || 0,
          likedBy: cData.likedBy || [],
          replyCount: cData.replyCount || 0,
          parentId: cData.parentId || undefined
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
        createdAt: serverTimestamp(),
        likesCount: 0,
        likedBy: [],
        replyCount: 0,
        parentId: activeReplyId || null
      });
      
      if (activeReplyId) {
        const parentRef = doc(db, `posts/${post.id}/comments`, activeReplyId);
        await updateDoc(parentRef, {
          replyCount: increment(1)
        });
      }

      setNewComment('');
      setActiveReplyId(null);
      setActiveReplyName(null);
      setIsSubmittingComment(false);
    } catch (_err: any) {
      setIsSubmittingComment(false);
      setCommentError("Failed to publish comment.");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!requireAuth("Like Comment")) return;
    if (!user) return;
    
    const commentToUpdate = comments.find(c => c.id === commentId);
    if (!commentToUpdate) return;
    
    const isCommentLiked = commentToUpdate.likedBy.includes(user.uid);
    const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
    
    try {
      if (isCommentLiked) {
        await updateDoc(commentRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(commentRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(user.uid)
        });
      }
    } catch (err) {
      console.error("Error liking comment", err);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!requireAuth("Report Comment")) return;
    if (window.confirm("Are you sure you want to report this comment for being harmful, dangerous, violent, or hateful?")) {
      try {
        await addDoc(collection(db, 'reports'), {
          type: 'comment',
          commentId,
          postId: post.id,
          reportedBy: user?.uid,
          createdAt: serverTimestamp()
        });
        alert("Comment reported successfully.");
      } catch (err) {
        console.error("Failed to report comment", err);
        alert("Report submitted.");
      }
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
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
              <div className={styles.actionBtns} style={{ alignSelf: 'flex-end', gap: '16px' }}>
                <button 
                  onClick={toggleSave}
                  title="Save bookmark"
                  style={{ background: 'transparent', border: 'none', color: '#fff', padding: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}
                >
                  <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{savesCount}</span>
                </button>
                <button 
                  onClick={toggleLike}
                  title="Like artwork"
                  style={{ background: 'transparent', border: 'none', color: isLiked ? '#ef4444' : '#fff', padding: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}
                  className={isLiked ? styles.heartLiked : ''}
                >
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{likesCount}</span>
                </button>
                <div
                  title={`${post.viewsCount} views`}
                  style={{ background: 'transparent', border: 'none', color: '#fff', padding: '4px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={22} strokeWidth={2} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{post.viewsCount}</span>
                </div>
              </div>

            <div className={styles.bottomOverlay}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                <span className={styles.captionTitle} style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{post.title}</span>
                <div className={styles.creatorTiny} onClick={(e) => { e.stopPropagation(); navigate(`/creator/${post.creator.username}`); }} style={{ cursor: 'pointer' }}>
                  <span className={styles.creatorNameTiny} style={{ color: 'rgba(255,255,255,0.8)' }}>@{post.creator.displayName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {isModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => { if(onCloseOverride) onCloseOverride(); else setIsModalOpen(false); }}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => { if(onCloseOverride) onCloseOverride(); else setIsModalOpen(false); }} aria-label="Close">
              <X size={18} strokeWidth={2.5} />
            </button>
            
            <div className={styles.modalLeftColumn}>
              <div className={styles.leftColumnContent}>
                <h2 className={styles.leftArtworkTitle}>{post.title}</h2>

                <div className={styles.modalImageContainer}>
                  <div 
                    className={styles.modalImageBlurBg} 
                    style={{ backgroundImage: `url(${post.imageUrls[activeImageIndex]})` }} 
                  />
                  <img 
                    src={post.imageUrls[activeImageIndex]} 
                    alt={post.title} 
                    className={styles.modalMainImage} 
                  />
                
                {post.imageUrls.length > 1 && (
                  <>
                    {activeImageIndex > 0 && (
                      <button 
                        className={styles.navArrowLeft} 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev - 1); }}
                      >
                        <ChevronLeft size={32} color="#fff" />
                      </button>
                    )}
                    {activeImageIndex < post.imageUrls.length - 1 && (
                      <button 
                        className={styles.navArrowRight} 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev + 1); }}
                      >
                        <ChevronRight size={32} color="#fff" />
                      </button>
                    )}
                  </>
                )}
                
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

              <div className={styles.modalActionBar}>
                <button className={`${styles.barBtn} ${isLiked ? styles.barBtnActive : ''}`} onClick={toggleLike} title="Like">
                  <Heart size={17} fill={isLiked ? "currentColor" : "none"} />
                  {likesCount > 0 && <span>{likesCount}</span>}
                </button>
                <button className={`${styles.barBtn} ${isSaved ? styles.barBtnActive : ''}`} onClick={toggleSave} title="Save">
                  <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
                  {savesCount > 0 && <span>{savesCount}</span>}
                </button>
                <button className={`${styles.barBtn} ${showComments ? styles.barBtnActive : ''}`} onClick={handleCommentsClick} onContextMenu={handleCommentsContextMenu} title="Comments">
                  <MessageSquare size={17} />
                  {comments.length > 0 && <span style={{ fontWeight: 500 }}>{comments.length}</span>}
                </button>
                <button className={styles.barBtn} onClick={handleShareLink} style={isLinkCopied ? { color: '#10b981', borderColor: '#10b981' } : {}} title="Share">
                  {isLinkCopied ? <Check size={17} /> : <Share2 size={17} />}
                </button>
                <button className={styles.barBtn} onClick={handleReportPost} style={{ color: '#f43f5e', borderColor: 'rgba(244,63,94,0.3)' }} title="Report">
                  <Flag size={17} />
                </button>
              </div>

              <div ref={commentsRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.25rem 2.5rem 2rem 2.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                
                {commentError && (
                  <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(244,63,94,0.1)', color: '#f43f5e', borderRadius: '6px', fontSize: '0.8rem' }}>
                    {commentError}
                  </div>
                )}

                <form onSubmit={handleSubmitComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeReplyId && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span>Replying to <strong style={{ color: 'var(--text-primary)' }}>{activeReplyName}</strong></span>
                      <button type="button" onClick={() => { setActiveReplyId(null); setActiveReplyName(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder={user ? "Write a comment..." : "Sign in to comment..."} 
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      disabled={isSubmittingComment}
                      style={{ flex: 1, padding: '0.5rem 0.85rem', borderRadius: '0px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none', fontWeight: 500 }}
                    />
                    <button type="submit" className="btn-outline" disabled={isSubmittingComment || !newComment.trim()} style={{ padding: '0.5rem 1rem', borderRadius: '0px', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                      {isSubmittingComment ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
                    </button>
                  </div>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {comments.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>No comments yet.</span>
                  ) : (
                    comments.filter(c => !c.parentId).map(c => {
                      const replies = comments.filter(r => r.parentId === c.id);
                      const isExpanded = expandedReplies[c.id];
                      return (
                        <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          <div style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'transparent', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <img src={c.authorAvatar} alt={c.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{c.authorName}</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.createdAt}</span>
                              </div>
                              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 400 }}>{c.text}</span>
                              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                <button onClick={() => handleLikeComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: c.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                  <Heart size={12} fill={c.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'none'} />
                                  {c.likesCount > 0 && <span>{c.likesCount}</span>}
                                </button>
                                <button onClick={() => { setActiveReplyId(c.id); setActiveReplyName(c.authorName); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                  <MessageCircle size={12} /> Reply
                                </button>
                                <button onClick={() => handleReportComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                  <Flag size={12} /> Report
                                </button>
                              </div>
                            </div>
                          </div>

                          {c.replyCount > 0 && (
                            <button onClick={() => toggleReplies(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', paddingLeft: '2.5rem', alignSelf: 'flex-start' }}>
                              <div style={{ width: '16px', height: '1px', backgroundColor: 'var(--border-color)', marginRight: '0.5rem' }}></div>
                              {isExpanded ? 'Hide replies' : `View ${c.replyCount} replies`}
                            </button>
                          )}

                          {isExpanded && replies.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingLeft: '2.5rem' }}>
                              {replies.map(reply => (
                                <div key={reply.id} style={{ display: 'flex', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'transparent', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                  <img src={reply.authorAvatar} alt={reply.authorName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{reply.authorName}</strong>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{reply.createdAt}</span>
                                    </div>
                                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.1rem', fontWeight: 400 }}>{reply.text}</span>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                                      <button onClick={() => handleLikeComment(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: reply.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                        <Heart size={12} fill={reply.likedBy?.includes(user?.uid || '') ? '#ef4444' : 'none'} />
                                        {reply.likesCount > 0 && <span>{reply.likesCount}</span>}
                                      </button>
                                      <button onClick={() => { setActiveReplyId(c.id); setActiveReplyName(reply.authorName); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                        <MessageCircle size={12} /> Reply
                                      </button>
                                      <button onClick={() => handleReportComment(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: '0.3rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: 0 }}>
                                        <Flag size={12} /> Report
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              </div>
            </div>

            <div className={styles.modalRightColumn}>
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div className={styles.creatorProfileModal}>
                    <img src={post.creator.avatarUrl} alt={post.creator.displayName} className={styles.avatarModal} style={{ borderRadius: '50%' }} />
                    <div className={styles.creatorInfoWrapper}>
                      <span className={styles.curatedByLabel}>Curated by</span>
                      <h4 className={styles.creatorNameModal}>{post.creator.displayName}</h4>
                    </div>
                  </div>
                  
                  {user?.uid !== post.creator.uid && (
                    <button 
                      className={isFollowing ? "btn-solid" : "btn-outline"} 
                      onClick={toggleFollow}
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', borderRadius: '6px', alignSelf: 'flex-end', marginBottom: '0.1rem', border: 'none' }}
                    >
                      {isFollowing ? 'Following' : '+ Follow'}
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setActiveTab('prompt')}
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: activeTab === 'prompt' ? 'var(--text-primary)' : 'var(--text-muted)',
                    borderBottom: activeTab === 'prompt' ? '2px solid var(--text-primary)' : '2px solid transparent',
                    paddingBottom: '0.5rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    background: 'none',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                  }}
                >
                  Prompt
                </button>
                {post.description && (
                  <button
                    onClick={() => setActiveTab('description')}
                    style={{
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: activeTab === 'description' ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderBottom: activeTab === 'description' ? '2px solid var(--text-primary)' : '2px solid transparent',
                      paddingBottom: '0.5rem',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      background: 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                    }}
                  >
                    Description
                  </button>
                )}
              </div>

              <div style={{ minHeight: '120px' }}>
                {activeTab === 'prompt' ? (
                  <div className={styles.promptVaultBox}>
                    {isCreator && effectiveMonetization !== 'free' && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.85rem', fontSize: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700 }}>
                          <span>Creator Access Enabled</span>
                          <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>— Users see the {effectiveMonetization === 'subscribers_only' ? 'Subscriber' : 'Ad Watch'} paywall</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPreviewPaywall(!previewPaywall); }}
                          style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                        >
                          {previewPaywall ? 'Show Real Prompt' : 'Preview Public Paywall'}
                        </button>
                      </div>
                    )}


                    {isWatchingAd ? (
                      <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', border: '2px dashed #10b981', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                        <Loader2 size={38} style={{ animation: 'spin 1s linear infinite', color: '#10b981' }} />
                        <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>Playing Community Sponsor Message...</strong>
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
                            {effectiveMonetization === 'subscribers_only' ? 'Subscriber Only Vault' : 'Free Ad-Supported Vault'}
                          </div>
                          <h5 className={styles.lockTitle}>Protected AI Creation by @{post.creator.username}</h5>
                          <p className={styles.lockDesc}>
                            Full generative parameters, styling seeds, and camera weights are securely blurred and protected from inspection until unlocked.
                          </p>
                          {effectiveMonetization === 'subscribers_only' ? (
                            <button
                              className={styles.whopUnlockBtn}
                              onClick={handleSubscribeToUnlock}
                              style={{ background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b' }}
                            >
                              Subscribe to Unlock
                            </button>
                          ) : (
                            <button
                              className={styles.whopUnlockBtn}
                              onClick={handleWatchAdToUnlock}
                              style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                              <PlayCircle size={18} />
                              <span>Watch an Ad to Unlock Prompt</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                          <RichTextRenderer content={post.promptText} className={styles.promptCode} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                          <button 
                            onClick={handleCopyPrompt}
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '2px', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <p className={styles.promptCode} style={{ whiteSpace: 'pre-wrap' }}>{post.description}</p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>Generation Details</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={styles.genDetailPill}>{post.model || 'Midjourney V6'}</span>
                  {post.aspectRatio && post.aspectRatio !== 'Unknown' && (
                    <span className={styles.genDetailPill}>AR {post.aspectRatio}</span>
                  )}
                  {post.createdAt && (
                    <span className={styles.genDetailPill}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }
                    </span>
                  )}
                </div>
              </div>



            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}
    </>
  );
}
