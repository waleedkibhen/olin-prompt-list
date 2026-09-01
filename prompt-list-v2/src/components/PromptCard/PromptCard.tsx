import React, { useState, useEffect } from 'react';
import styles from './PromptCard.module.css';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '@/lib/imageOptimization';
import { Bookmark, Heart, Eye } from 'lucide-react';
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';
import PromptModal from './PromptModal';

export interface PromptCardProps {
  post: PromptPost;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  defaultOpen?: boolean;
  onCloseOverride?: () => void;
  eager?: boolean;
}

export default function PromptCard({ post, onLike, onSave, defaultOpen = false, onCloseOverride, eager = false }: PromptCardProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(defaultOpen);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [savesCount, setSavesCount] = useState(post.savesCount);

  useEffect(() => {
    try {
      if (user && profile) {
        const savedArr = profile.savedPosts || JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
        const likedArr = profile.likedPosts || JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
        setIsSaved(savedArr.includes(post.id));
        setIsLiked(likedArr.includes(post.id));
      } else if (user) {
        const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
        const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
        setIsSaved(savedArr.includes(post.id));
        setIsLiked(likedArr.includes(post.id));
      }
    } catch {}
  }, [user, profile, post.id]);

  const requireAuth = (_actionName: string): boolean => {
    if (!user) {
      toast.error('Sign in to perform this action.');
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

    try {
      const likedArr = JSON.parse(localStorage.getItem(`likes_${user.uid}`) || '[]');
      const nextArr = nextVal ? [...likedArr, post.id] : likedArr.filter((item: string) => item !== post.id);
      localStorage.setItem(`likes_${user.uid}`, JSON.stringify(nextArr));
    } catch {}

    if (onLike) onLike(post.id);
    
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

    try {
      const savedArr = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      const nextArr = nextVal ? [...savedArr, post.id] : savedArr.filter((item: string) => item !== post.id);
      localStorage.setItem(`saves_${user.uid}`, JSON.stringify(nextArr));
    } catch {}

    if (onSave) onSave(post.id);
    
    const postUpdate = updateDoc(doc(db, 'posts', post.id), { savesCount: increment(nextVal ? 1 : -1) });
    const userUpdate = updateDoc(doc(db, 'users', user.uid), { 
      savedPosts: nextVal ? arrayUnion(post.id) : arrayRemove(post.id) 
    });
    await Promise.all([postUpdate, userUpdate]).catch(() => {});
  };

  return (
    <>
      <Link 
        to={`/post/${post.id}`} 
        className={styles.cardContainer} 
        onClick={(e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        <div className={styles.imageWrapper}>
          <img 
            src={getOptimizedImageUrl(post.imageUrls[0], 600)} 
            alt={post.title || 'Prompt artwork'}
            className={styles.postImage}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : 'auto'}
            decoding="async"
          />
          <div className={styles.overlay}>
              <div className={styles.actionBtns} style={{ alignSelf: 'flex-end', gap: '16px' }}>
                <button onClick={toggleSave} title="Save bookmark" style={{ background: 'transparent', border: 'none', color: '#fff', padding: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                  <Bookmark size={22} fill={isSaved ? "currentColor" : "none"} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{savesCount}</span>
                </button>
                <button onClick={toggleLike} title="Like artwork" style={{ background: 'transparent', border: 'none', color: isLiked ? '#ef4444' : '#fff', padding: '4px', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }} className={isLiked ? styles.heartLiked : ''}>
                  <Heart size={22} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{likesCount}</span>
                </button>
                <div title={`${post.viewsCount} views`} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '4px', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                  <Eye size={22} strokeWidth={2} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{post.viewsCount}</span>
                </div>
              </div>
            <div className={styles.bottomOverlay}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflow: 'hidden' }}>
                <span className={styles.captionTitle} style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{post.title}</span>
                <div className={styles.creatorTiny} onClick={(e) => { e.stopPropagation(); navigate(`/creator/${post.creator.username}`); }} style={{ cursor: 'pointer' }}>
                  <span className={styles.creatorNameTiny} style={{ color: 'rgba(255,255,255,0.8)' }}>@{post.creator.username}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {isModalOpen && (
        <PromptModal 
          post={post}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isLiked={isLiked}
          isSaved={isSaved}
          likesCount={likesCount}
          savesCount={savesCount}
          toggleLike={toggleLike}
          toggleSave={toggleSave}
          onCloseOverride={onCloseOverride}
          defaultOpen={defaultOpen}
        />
      )}
    </>
  );
}

