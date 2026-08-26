import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { moderateText } from '@/lib/ai';

export interface CommentItem {
  id: string;
  authorName: string;
  authorAvatar : string;
  text: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  replyCount: number;
  parentId?: string;
  userId?: string;
  rawTimestamp?: number;
}

export function useComments(postId: string, isModalOpen: boolean) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(commentsQuery, (snap) => {
      const items: CommentItem[] = [];
      snap.forEach(docSnap => {
        const cData = docSnap.data();
        items.push({
          id: docSnap.id,
          authorName: cData.authorName || 'User',
          authorAvatar : cData.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          text: cData.text || '',
          createdAt: cData.createdAt?.toDate ? cData.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now',
          likesCount: cData.likesCount || 0,
          likedBy: cData.likedBy || [],
          replyCount: cData.replyCount || 0,
          parentId: cData.parentId || undefined,
          userId: cData.userId || cData.uid || '',
          rawTimestamp: cData.createdAt?.toMillis ? cData.createdAt.toMillis() : Date.now()
        });
      });
      
      // Sort comments: Highest likes first, then newest first
      items.sort((a, b) => {
        if (b.likesCount !== a.likesCount) {
          return b.likesCount - a.likesCount;
        }
        return (b.rawTimestamp || 0) - (a.rawTimestamp || 0);
      });
      
      setComments(items);
    });

    return () => unsubscribe();
  }, [postId, isModalOpen]);

  const submitComment = async (
    text: string, 
    user: any, 
    profile: any, 
    parentId: string | null = null
  ): Promise<boolean> => {
    if (!text.trim() || !user || !profile) return false;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const modResult = await moderateText(text.trim());
      if (!modResult.approved) {
        setIsSubmitting(false);
        setError("Comment could not be published due to content safety guidelines.");
        return false;
      }

      const commentsRef = collection(db, `posts/${postId}/comments`);
      await addDoc(commentsRef, {
        userId: user.uid,
        authorName: profile.username || profile.displayName || user.displayName || 'Creator',
        authorAvatar : profile.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: text.trim(),
        createdAt: serverTimestamp(),
        likesCount: 0,
        likedBy: [],
        replyCount: 0,
        parentId: parentId || null
      });
      
      if (parentId) {
        const parentRef = doc(db, `posts/${postId}/comments`, parentId);
        await updateDoc(parentRef, {
          replyCount: increment(1)
        }).catch((e) => console.warn("Could not increment replyCount due to rules:", e));
      }

      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit comment');
      setIsSubmitting(false);
      return false;
    }
  };

  const likeComment = async (commentId: string, userId: string | undefined) => {
    if (!userId) return;
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;
    
    const isLiked = comment.likedBy.includes(userId);
    const commentRef = doc(db, `posts/${postId}/comments`, commentId);
    
    try {
      if (isLiked) {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: c.likesCount - 1, likedBy: c.likesCount > 0 ? c.likedBy.filter(id => id !== userId) : [] } : c));
        await updateDoc(commentRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(userId)
        });
      } else {
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, likesCount: c.likesCount + 1, likedBy: [...c.likedBy, userId] } : c));
        await updateDoc(commentRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(userId)
        });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const deleteComment = async (commentId: string, parentId?: string) => {
    try {
      await deleteDoc(doc(db, `posts/${postId}/comments`, commentId));
      if (parentId) {
        const parentRef = doc(db, `posts/${postId}/comments`, parentId);
        await updateDoc(parentRef, {
          replyCount: increment(-1)
        }).catch((e) => console.warn("Could not decrement reply count:", e));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return {
    comments,
    isSubmitting,
    error,
    submitComment,
    likeComment,
    deleteComment,
    setError
  };
}
