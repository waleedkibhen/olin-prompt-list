import WhopCheckoutModal from '../WhopCheckoutModal';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp, setDoc, deleteDoc, arrayUnion, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Heart, Bookmark, Copy, Check, Share2, MessageSquare, Loader2, PlayCircle, Flag, Eye, X, ChevronLeft, ChevronRight, Plus, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ENABLE_MONETIZATION, ENABLE_ADS } from '@/lib/config';
import ReportModal from '@/components/ReportModal';
import DiscoverMore from '../DiscoverMore';
import RichTextRenderer, { copyRichPrompt } from '@/components/RichTextRenderer';
import toast from 'react-hot-toast';
import { hasViewedRecently, recordView } from '@/lib/viewTracker';
import { updateSEOTags, resetSEOTags } from '@/lib/seo';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';

// Unlock persistence: primary key per-user, with read-compat for the legacy global key.
const unlockStorageKey = (uid?: string | null) => (uid ? `unlocked_${uid}` : 'unlocked_guest');
const isLocallyUnlocked = (postId: string, uid?: string | null): boolean => {
  try {
    const primary = JSON.parse(localStorage.getItem(unlockStorageKey(uid)) || '[]');
    if (Array.isArray(primary) && primary.includes(postId)) return true;
    const legacy = JSON.parse(localStorage.getItem('unlockedPrompts') || '[]');
    return Array.isArray(legacy) && legacy.includes(postId);
  } catch {
    return false;
  }
};

import CommentsSection from './CommentsSection';
import { useComments } from '@/hooks/useComments';

export default function PromptModal({ post, isModalOpen, setIsModalOpen, isLiked, isSaved, likesCount, savesCount, toggleLike, toggleSave, onCloseOverride, defaultOpen }: { post: PromptPost; [key: string]: any }) {

  // Legacy 'ad'/'ad_supported' posts fall back to free content when ads are disabled
  const effectiveMonetization = (() => {
    if (!ENABLE_MONETIZATION) return 'free';
    const raw = (post.monetizationType as any) === 'ad' ? 'ad_supported' : (post.monetizationType || (post.accessTier === 'subscriber' ? 'subscribers_only' : (post.isPaid ? 'subscribers_only' : 'free')));
    return !ENABLE_ADS && raw === 'ad_supported' ? 'free' : raw;
  })();
  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || (post.monetizationType as any) === 'ad_supported' || (post.monetizationType as any) === 'ad');
  const [adDelayComplete, setAdDelayComplete] = useState(true);
  const { user, profile, signInWithGoogle } = useAuth();
  const isOwner = Boolean(user && (user.uid === post.creator?.uid));
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    const isFree = !ENABLE_MONETIZATION ? true : (effectiveMonetization === 'free' || effectiveMonetization === 'ad_supported');
    return isFree || isOwner || isLocallyUnlocked(post.id, user?.uid);
  });
  const [securePrompts, setSecurePrompts] = useState<string[] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [creatorSubSettings, setCreatorSubSettings] = useState<any>(null);
  const [showSubCheckout, setShowSubCheckout] = useState(false);
  const [subBilling, setSubBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [subPromptCount, setSubPromptCount] = useState<number | null>(null);
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

      const [isFollowing, setIsFollowing] = useState(false);
      
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('prompt-0');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const effectivePrompts = useMemo(() => {
    // Paid content lives in the protected subcollection — prefer it once fetched
    if (securePrompts && securePrompts.length > 0) {
      return securePrompts;
    }

    if (post.prompts && post.prompts.length > 1) {
      return post.prompts;
    }
    
    if (post.promptText) {
      // Legacy compatibility: Parse manually typed variants like "V1 -" or "Variant 2 -"
      if (/(?:V|Variant)\s*1\s*-/i.test(post.promptText) && /(?:V|Variant)\s*2\s*-/i.test(post.promptText)) {
        const matches = [...post.promptText.matchAll(/(?:^|<p>|<br>|\n)(?:<[^>]+>)*(?:V|Variant)\s*\d+\s*-/gi)];
        if (matches.length > 1 && matches[0].index !== undefined) {
          const result = [];
          for (let i = 0; i < matches.length; i++) {
            const start = matches[i].index as number;
            const end = i + 1 < matches.length ? (matches[i + 1].index as number) : post.promptText.length;
            
            // Clean up the prefix tag if it accidentally grabbed the starting paragraph tag
            let chunk = post.promptText.substring(start, end);
            if (i > 0 && chunk.startsWith('<p>')) {
               // keep the formatting intact but we're splitting it cleanly
            }
            result.push(chunk);
          }
          return result;
        }
      }
    }
    
    return [post.promptText || ''];
  }, [post.promptText, post.prompts, securePrompts]);

  // Paid prompts live in posts/{id}/secure_content — readable by the creator and
  // by any user whose uid is recorded in users/{uid}.purchasedPrompts (Firestore rules).
  useEffect(() => {
    if (!isModalOpen || !user) return;
    if (effectiveMonetization !== 'charge' && effectiveMonetization !== 'subscribers_only') return;
    if (!isUnlocked && !isOwner) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'posts', post.id, 'secure_content', 'data'));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data();
          const list: string[] = Array.isArray(data.prompts) && data.prompts.length > 0 ? data.prompts : [data.promptText || ''];
          setSecurePrompts(list);
        }
      } catch {
        // Rules may deny non-purchasers; the vault stays up in that case.
      }
    })();
    return () => { cancelled = true; };
  }, [isModalOpen, user, effectiveMonetization, isUnlocked, isOwner, post.id]);

  const handleImageTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && post.imageUrls && activeImageIndex < post.imageUrls.length - 1) {
      setActiveImageIndex(prev => prev + 1);
    }
    if (isRightSwipe && activeImageIndex > 0) {
      setActiveImageIndex(prev => prev - 1);
    }
  };

  const [previewPaywall, setPreviewPaywall] = useState(false);
  const isCreator = Boolean(user && user.uid === post.creator.uid);
  const isProtected = Boolean((effectiveMonetization === 'charge' || effectiveMonetization === 'subscribers_only') && (!isUnlocked || (isCreator && previewPaywall)));

  // While locked, reveal the variant count (non-secret) so buyers know what they're paying for.
  const promptTabCount = isProtected
    ? Math.max(1, post.variantCount || 0)
    : Math.max(1, effectivePrompts.length);

  const handleTabTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const availableTabs = Array.from({ length: promptTabCount }, (_, i) => `prompt-${i}`);
    if (post.description) availableTabs.push('description');
    
    const currentIndex = availableTabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < availableTabs.length - 1) {
      setActiveTab(availableTabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(availableTabs[currentIndex - 1]);
    }
  };
  const [isWatchingAd] = useState(false);

  const { comments, isSubmitting: isSubmittingComment, error: commentError, submitComment, likeComment: handleLikeComment, deleteComment: handleDeleteComment } = useComments(post.id, isModalOpen);
  const [newComment, setNewComment] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [activeReplyName, setActiveReplyName] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});

  // Modal URL Synchronization
  useEffect(() => {
    // Only handle URL sync if the modal wasn't opened via a direct link (defaultOpen)
    if (!defaultOpen) {
      if (isModalOpen) {
        // Push state so URL changes to the post's URL, without triggering a full reload
        window.history.pushState({ modalId: post.id }, '', `/post/${post.id}`);
        updateSEOTags(`https://getolin.xyz/post/${post.id}`, post.promptText || post.description || '', post.title);
      } else {
        // If modal is closed but we're still on the post URL, revert to feed URL
        if (window.location.pathname === `/post/${post.id}`) {
          window.history.replaceState(null, '', '/');
          resetSEOTags();
        }
      }
    }
    
    // Handle the browser back button
    const handlePopState = () => {
      // If we are no longer on the post URL, ensure the modal is closed
      if (!window.location.pathname.startsWith(`/post/${post.id}`)) {
        if (!defaultOpen && isModalOpen) {
          if (onCloseOverride) onCloseOverride();
          else setIsModalOpen(false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isModalOpen, post.id, post.promptText, post.description, post.title, defaultOpen, onCloseOverride, setIsModalOpen]);

  

    

  

  useEffect(() => {
    const isFree = effectiveMonetization === 'free' || effectiveMonetization === 'ad_supported';
    
    let subUnlocked = false;
    if (user && effectiveMonetization === 'subscribers_only') {
      const creatorUid = post.creator?.uid || post.creatorId;
      // Strict per-creator gate: only an active subscription to THIS creator unlocks.
      // Legacy platform-premium flags (isPremium / olin_recent_success) no longer
      // grant subscriber-only content.
      if (creatorUid && profile?.activeSubscriptions?.includes(creatorUid)) {
        subUnlocked = true;
      }
    }

    setIsUnlocked(isFree || isOwner || subUnlocked || isLocallyUnlocked(post.id, user?.uid));

    if (user && profile) {
      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
      if (post.creator?.uid) {
        setIsFollowing(followedArr.includes(post.creator.uid));
      }
    }
  }, [user, profile, post.id, post.creator?.uid, post.creatorId, post.isPaid, post.monetizationType, post.accessTier, effectiveMonetization, isOwner]);

  

  useEffect(() => {
    if (isModalOpen) {
      const incrementView = async () => {
        try {
          if (!hasViewedRecently(post.id)) {
            const postRef = doc(db, 'posts', post.id);
            await updateDoc(postRef, { viewsCount: increment(1) });
            recordView(post.id);
          }
        } catch (err) {
          console.error("Failed to increment view count:", err);
        }
      };
      incrementView();
    }
  }, [isModalOpen, post.id]);

  const requireAuth = (_actionName: string): boolean => {
    if (!user) {
      toast.error('Sign in to perform this action.');
      signInWithGoogle();
      return false;
    }
    return true;
  };

  
  
  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("Follow")) return;
    if (!user || !post.creator?.uid) return;

    const creatorUid = post.creator.uid;
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);

    const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...followedArr, creatorUid] : followedArr.filter((item: string) => item !== creatorUid);
    localStorage.setItem(`following_${user.uid}`, JSON.stringify(nextArr));
    
    const followDocId = `${user.uid}_${creatorUid}`;
    try {
      if (nextVal) {
        await setDoc(doc(db, 'follows', followDocId), {
          followerId: user.uid,
          followingId: creatorUid,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(doc(db, 'follows', followDocId));
      }
    } catch (err) {
      console.error("Failed to update follow status in Firestore", err);
    }
  };

  const handleCopyPrompt = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const activeIdx = parseInt(activeTab.split('-')[1] || '0');
    const promptToCopy = effectivePrompts[activeIdx] || post.promptText;
    await copyRichPrompt(promptToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);

    try {
      await updateDoc(doc(db, 'posts', post.id), { copiesCount: increment(1) });
    } catch (err) {
      console.error("Failed to increment copy count:", err);
    }
  };

  
  const handlePaymentSuccess = () => {
    setShowCheckout(false);
    setIsUnlocked(true);
    try {
      const key = unlockStorageKey(user?.uid);
      const unlocked = JSON.parse(localStorage.getItem(key) || '[]');
      if (!unlocked.includes(post.id)) {
        unlocked.push(post.id);
        localStorage.setItem(key, JSON.stringify(unlocked));
      }
    } catch {}
    // Grant future access per Firestore rules (users/{uid}.purchasedPrompts)
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { purchasedPrompts: arrayUnion(post.id) }).catch(() => {});
    }
  };

  const handleWatchAdToUnlock = () => {
    // We intentionally allow this click to bubble up to the document so Monetag's listener can detect it!
    
    // Dynamically inject the Monetag Vignette Script
    // The Monetag script is already injected on modal open.
    // The click itself will be intercepted by Monetag's listener.

    // Bypass the clunky blue spinner and instantly unlock the card,
    // but reset adDelayComplete so the fluid 1.5s skeleton loading animation plays
    // behind the Vignette overlay while the ad initializes and the user watches it.
    setIsUnlocked(true);
    setAdDelayComplete(false);

    setTimeout(() => {
      setAdDelayComplete(true);
      
      try {
        const unlockedRaw = localStorage.getItem('unlockedPrompts');
        const unlocked = unlockedRaw ? JSON.parse(unlockedRaw) : [];
        if (!unlocked.includes(post.id)) {
          unlocked.push(post.id);
          localStorage.setItem('unlockedPrompts', JSON.stringify(unlocked));
        }
      } catch {}
    }, 1500);
  };

  // Fetch the creator's membership configuration for Subscriber-Only posts
  useEffect(() => {
    const creatorUid = post.creator?.uid;
    if (effectiveMonetization !== 'subscribers_only' || !creatorUid) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', creatorUid));
        if (cancelled) return;
        if (snap.exists()) {
          const d = snap.data() as any;
          const plan = d.subscriptionPlan
            ? d.subscriptionPlan
            : d.subscriptionSettings
              ? { enabled: d.subscriptionSettings.enabled, monthlyPrice: d.subscriptionSettings.monthlyPrice, yearlyPrice: 0, benefits: d.subscriptionSettings.description ? [d.subscriptionSettings.description] : [], monthlyPlanId: d.subscriptionSettings.planId, yearlyPlanId: '' }
              : null;
          setCreatorSubSettings(plan);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [effectiveMonetization, post.creator?.uid]);

  // Auto-count how many subscriber-only prompts this creator has published
  useEffect(() => {
    const creatorUid = post.creator?.uid;
    if (effectiveMonetization !== 'subscribers_only' || isUnlocked || isOwner || !creatorUid) return;
    let cancelled = false;
    (async () => {
      try {
        const q = query(collection(db, 'posts'), where('creatorId', '==', creatorUid), where('monetizationType', '==', 'subscribers_only'));
        const snap = await getCountFromServer(q);
        if (!cancelled) setSubPromptCount(snap.data().count);
      } catch {
        if (!cancelled) setSubPromptCount(null);
      }
    })();
    return () => { cancelled = true; };
  }, [effectiveMonetization, isUnlocked, isOwner, post.creator?.uid]);

  const selectedSubPlanId = subBilling === 'yearly'
    ? (creatorSubSettings?.whopYearlyPlanId || creatorSubSettings?.yearlyPlanId)
    : (creatorSubSettings?.whopMonthlyPlanId || creatorSubSettings?.monthlyPlanId);

  const handleSubscribeToUnlock = () => {
    if (selectedSubPlanId) {
      setShowSubCheckout(true);
    } else {
      toast.error(`@${post.creator.username} hasn't set up a membership plan yet.`);
    }
  };

  const handleSubscribeSuccess = () => {
    setShowSubCheckout(false);
    setIsUnlocked(true);
    // Record the creator subscription so Firestore rules grant secure-content access
    if (user && post.creator?.uid) {
      updateDoc(doc(db, 'users', user.uid), { activeSubscriptions: arrayUnion(post.creator.uid) }).catch(() => {});
    }
  };

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = window.location.origin + "/post/" + post.id;
    navigator.clipboard.writeText(shareUrl);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2500);
  };

  const handleSubmitComment = async (e: any) => {
    e.preventDefault();
    const success = await submitComment(newComment, user, profile, activeReplyId);
    if (success) {
      setNewComment('');
      setActiveReplyId(null);
      setActiveReplyName(null);
    }
  };

  
  const handleReportComment = async (commentId: string) => {
    if (!requireAuth("Report Comment")) return;
    toast(
      (t) => (
        <span style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontWeight: 500 }}>Report this comment?</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.75 }}>Flag as harmful, hateful, or dangerous content.</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await addDoc(collection(db, 'reports'), {
                    type: 'comment',
                    commentId,
                    postId: post.id,
                    reportedBy: user?.uid,
                    createdAt: serverTimestamp()
                  });
                  toast.success('Comment reported successfully.');
                } catch (err) {
                  console.error('Failed to report comment', err);
                  toast.success('Report submitted.');
                }
              }}
              style={{ padding: '0.3rem 0.75rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Report
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{ padding: '0.3rem 0.75rem', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: Infinity }
    );
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
      toast.error('Please sign in to report community guideline violations.');
      return;
    }
    setIsReportModalOpen(true);
  };



  return (
    <>
              <div className={styles.modalBackdrop} onClick={(e) => { if (e.target === e.currentTarget) { if(onCloseOverride) onCloseOverride(); else setIsModalOpen(false); } }}>
          <div className={styles.modalCard}>
            <button className={styles.modalCloseBtn} onClick={() => { if(onCloseOverride) onCloseOverride(); else setIsModalOpen(false); }} aria-label="Close">
              <X size={18} strokeWidth={2.5} />
            </button>
            
            <div className={styles.modalTopRow}>
            <div className={styles.modalLeftColumn}>
              <div className={styles.leftColumnContent}>
                <h2 className={styles.leftArtworkTitle}>{post.title}</h2>

                <div 
                  className={styles.modalImageContainer}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleImageTouchEnd}
                >
                  <div 
                    className={styles.modalImageBlurBg} 
                    style={{ backgroundImage: `url(${getOptimizedImageUrl(post.imageUrls[activeImageIndex], 1200)})` }} 
                  />
                  <img 
                    src={getOptimizedImageUrl(post.imageUrls[activeImageIndex], 1200)} 
                    alt={post.title} 
                    className={styles.modalMainImage}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
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
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(idx); }}
                      >
                        <img src={getOptimizedImageUrl(url, 200)} alt={`Thumb ${idx + 1}`} className={styles.thumbImage} loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>
                )}
                </div>

              
                <div className={styles.mobileCreatorRow} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '1.5rem', marginLeft: '2.5rem', marginBottom: '0.5rem' }}>
                  <Link to={`/creator/${post.creator.username}`} className={styles.creatorProfileModalLink}>
                    <img src={post.creator.avatarUrl} alt={post.creator.username} className={styles.avatarModal} style={{ borderRadius: '50%' }} />
                    <div className={styles.creatorInfoWrapper}>
                      <span className={styles.curatedByLabel}>Curated by</span>
                      <h4 className={styles.creatorNameModal}>{post.creator.username}</h4>
                    </div>
                  </Link>
                  {user?.uid !== post.creator.uid && (
                    <button 
                      className={isFollowing ? styles.btnFollowingIcon : styles.btnFollowIcon} 
                      onClick={toggleFollow}
                      style={{ alignSelf: 'flex-end', marginBottom: '0.1rem' }}
                      title={isFollowing ? "Unfollow" : "Follow"}
                    >
                      {isFollowing ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                    </button>
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
                {!isOwner && (
                  <button className={styles.barBtn} onClick={handleShareLink} style={isLinkCopied ? { color: '#0572F6', borderColor: '#0572F6' } : {}} title="Share">
                    {isLinkCopied ? <Check size={17} /> : <Share2 size={17} />}
                  </button>
                )}
                <button className={`${styles.barBtn} ${styles.reportBtn}`} onClick={handleReportPost} title="Report">
                  <Flag size={17} />
                </button>
              </div>

                {isOwner && (
                  <div className={styles.creatorShareBox}>
                    <p className={styles.creatorShareTitle}>Share your creations with others :)</p>
                    <div className={styles.creatorShareInputRow}>
                      <input type="text" readOnly value={`https://getolin.xyz/post/${post.id}`} className={styles.creatorShareInput} />
                      <button onClick={handleShareLink} className={styles.creatorShareCopyBtn}>
                        {isLinkCopied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
                
                </div>
              </div>

              <div className={styles.modalRightColumn}>
              

              <div className={styles.mobilePromptArea}>
              <div style={{ display: 'flex', gap: '1.5rem', borderBottom: 'none', marginBottom: '1rem', marginTop: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {promptTabCount > 1 ? (
                  Array.from({ length: promptTabCount }, (_, idx) => (
                    <button
                      key={`prompt-${idx}`}
                      onClick={() => setActiveTab(`prompt-${idx}`)}
                      style={{
                        fontFamily: "'Inter', -apple-system, sans-serif",
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: activeTab === `prompt-${idx}` ? 'var(--text-primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === `prompt-${idx}` ? '2px solid var(--text-primary)' : '2px solid transparent',
                        paddingBottom: '0.5rem',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        background: 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                      }}
                    >
                      Prompt {idx + 1}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => setActiveTab('prompt-0')}
                    style={{
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: activeTab === 'prompt-0' ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderBottom: activeTab === 'prompt-0' ? '2px solid var(--text-primary)' : '2px solid transparent',
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
                )}

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

              <div 
                style={{ minHeight: '120px' }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTabTouchEnd}
              >
                {activeTab.startsWith('prompt') ? (
                  <div className={styles.promptVaultBox}>
                      {isCreator && effectiveMonetization === 'charge' && (
                        <div style={{ marginBottom: '0.75rem', display: 'flex' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewPaywall(!previewPaywall); }}
                            style={{ background: '#0572F6', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            {previewPaywall ? (
                              <><X size={12} color="#fff" /> Stop Preview</>
                            ) : (
                              <><Eye size={12} color="#fff" /> Preview Paywall</>
                            )}
                          </button>
                        </div>
                      )}
                    


                    {isWatchingAd ? (
                      <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--bg-primary)', border: '2px dashed #0572F6', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                        <Loader2 size={38} style={{ animation: 'spin 1s linear infinite', color: '#0572F6' }} />
                        <strong style={{ fontSize: '1.1rem', color: '#0572F6' }}>Playing Community Sponsor Message...</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '340px' }}>
                          Thank you for supporting generative creators on Olin Prompt List! Prompt parameters unlocking in moments...
                        </span>
                      </div>
                    ) : isProtected ? (
                      <div className={styles.blurredVaultContainer}>
                        <div className={styles.dummyBlurBackground} aria-hidden="true">
                          <code>
                            /imagine prompt: cinematic editorial portrait, soft directional window light, 85mm lens, shallow depth of field, muted warm palette, subtle film grain, high detail --ar 4:5 --style raw
                          </code>
                        </div>
                        
                        <div className={styles.vaultOverlayContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 1rem' }}>
                          <div style={{ flex: 1, padding: '1.5rem', width: '100%', maxWidth: '380px', textAlign: 'center' }}>
                            {effectiveMonetization === 'subscribers_only' && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.35)', borderRadius: '9999px', padding: '0.3rem 0.8rem', marginBottom: '0.85rem', fontSize: '0.75rem', color: '#c084fc', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                <Lock size={12} /> Subscriber Only Content
                              </div>
                            )}
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                {effectiveMonetization === 'subscribers_only'
                                  ? `Subscribe to @${post.creator?.username || 'this creator'} to Unlock`
                                  : effectiveMonetization === 'charge' ? 'Pay to Unlock' : 'Watch an Ad to unlock'}
                            </div>

                            {effectiveMonetization === 'subscribers_only' && subPromptCount != null && subPromptCount > 0 && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '9999px', padding: '0.3rem 0.8rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>
                                ⚡ Instantly Unlocks {subPromptCount} Exclusive Prompt{subPromptCount === 1 ? '' : 's'}
                              </div>
                            )}

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                {effectiveMonetization === 'ad_supported'
                                  ? 'The creator has chosen to monetize their prompts through ads. Click the button below to watch an ad.'
                                  : effectiveMonetization === 'charge'
                                  ? 'The creator has opted for a pay-to-unlock model for this prompt. One payment unlocks it instantly.'
                                  : (creatorSubSettings?.benefits?.length
                                      ? null
                                      : 'Unlock this prompt and all exclusive drops with a Creator Membership.')}
                            </div>

                            {effectiveMonetization === 'subscribers_only' ? (
                              <>
                                {creatorSubSettings?.monthlyPrice != null && creatorSubSettings.monthlyPrice > 0 && (
                                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSubBilling('monthly'); }}
                                      style={{ flex: 1, padding: '0.55rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, border: subBilling === 'monthly' ? '2px solid #3b82f6' : '1px solid var(--border-color)', backgroundColor: subBilling === 'monthly' ? 'rgba(59, 130, 246, 0.12)' : 'transparent', color: 'var(--text-primary)' }}
                                    >
                                      Monthly · ${creatorSubSettings.monthlyPrice}/mo
                                    </button>
                                    {creatorSubSettings?.yearlyPrice != null && creatorSubSettings.yearlyPrice > 0 && (creatorSubSettings?.whopYearlyPlanId || creatorSubSettings?.yearlyPlanId) && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setSubBilling('yearly'); }}
                                        style={{ flex: 1, padding: '0.55rem 0.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, border: subBilling === 'yearly' ? '2px solid #3b82f6' : '1px solid var(--border-color)', backgroundColor: subBilling === 'yearly' ? 'rgba(59, 130, 246, 0.12)' : 'transparent', color: 'var(--text-primary)' }}
                                      >
                                        Yearly · ${creatorSubSettings.yearlyPrice}/yr
                                      </button>
                                    )}
                                  </div>
                                )}

                                {creatorSubSettings?.benefits?.length > 0 && (
                                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.45rem', textAlign: 'left' }}>
                                    {creatorSubSettings.benefits.map((b: string, i: number) => (
                                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                        <Check size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                                        <span>{b}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <button
                                  onClick={handleSubscribeToUnlock}
                                  className="btn-solid"
                                  style={{ width: '100%', padding: '0.75rem' }}
                                >
                                  Subscribe to Unlock
                                </button>
                              </>
                            ) : effectiveMonetization === 'charge' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); if (post.whopPlanId) { setShowCheckout(true); } else { alert('Creator has not setup a valid checkout for this item yet.'); } }}
                                className="btn-solid"
                                style={{ width: '100%', padding: '0.75rem' }}
                              >
                                Pay ${post.price || '1.99'} to Unlock
                              </button>
                            ) : (
                              <button
                                onClick={handleWatchAdToUnlock}
                                className="btn-solid"
                                style={{ width: '100%', padding: '0.75rem' }}
                              >
                                <PlayCircle size={18} /> Watch Ad
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <>
                          <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                            <RichTextRenderer 
                              content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                              className={styles.promptCode} 
                            />
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                            <button 
                              onClick={handleCopyPrompt}
                              className="btn-solid"
                              style={{ fontSize: '0.75rem', padding: '0.45rem 0.9rem' }}
                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </>
                      </>
                    )}
                  </div>
                ) : (
                  isAdSupported && !adDelayComplete ? (
                    <div className={styles.skeletonBox} style={{ height: "120px" }} />
                  ) : (
                    <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                      <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                    </div>
                  )
                )}
              </div>

              <div className={styles.mobileGenDetails} style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
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
            <div className={styles.discoverMoreArea}>
              <DiscoverMore currentPostId={post.id} />
            </div>
          </div>
        </div>

      {showComments && (
        <CommentsSection
          postId={post.id}
          user={user}
          profile={profile}
          comments={comments}
          newComment={newComment}
          setNewComment={setNewComment}
          isSubmitting={isSubmittingComment}
          commentError={commentError}
          handleSubmitComment={handleSubmitComment}
          handleLikeComment={(id: string) => handleLikeComment(id, user?.uid)}
          handleReportComment={handleReportComment}
          handleDeleteComment={(id: string) => handleDeleteComment(id, activeReplyId || undefined)}
          activeReplyId={activeReplyId}
          activeReplyName={activeReplyName}
          setActiveReplyId={setActiveReplyId}
          setActiveReplyName={setActiveReplyName}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
          onClose={() => setShowComments(false)}
        />
      )}


      {showCheckout && post.whopPlanId && (
        <WhopCheckoutModal
          planId={post.whopPlanId}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {showSubCheckout && selectedSubPlanId && (
        <WhopCheckoutModal
          planId={selectedSubPlanId}
          metadata={{ creatorId: post.creator?.uid || '', buyerId: user?.uid || '', billingInterval: subBilling }}
          onSuccess={handleSubscribeSuccess}
          onClose={() => setShowSubCheckout(false)}
        />
      )}

      {isReportModalOpen && <ReportModal post={post} onClose={() => setIsReportModalOpen(false)} />}

    </>
  );
}
