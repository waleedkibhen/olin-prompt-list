import React, { useEffect, useState } from 'react';
import styles from './saved.module.css';
import PromptCard from '@/components/PromptCard';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { Bookmark, Layers, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SavedPromptsPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [savedPosts, setSavedPosts] = useState<PromptPost[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [_savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    
    let currentIds: string[] = [];
    if (user) {
      currentIds = JSON.parse(localStorage.getItem(`saves_${user.uid}`) || '[]');
      setSavedIds(currentIds);
    } else {
      setLoadingDb(false);
      return;
    }

    if (currentIds.length === 0) {
      setSavedPosts([]);
      setLoadingDb(false);
      return;
    }

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matched: PromptPost[] = [];
      snapshot.forEach(docSnap => {
        if (currentIds.includes(docSnap.id)) {
          const d = docSnap.data();
          matched.push({
            id: docSnap.id,
            title: d.title || 'Untitled',
            description: d.description || '',
            promptText: d.promptText || '',
            negativePrompt: d.negativePrompt || null,
            imageUrls: d.imageUrls || [],
            model: d.model || 'Midjourney V6',
            styleTag: d.styleTag || 'Community',
            categories: d.categories || [],
            creator: {
              uid: d.creatorId || 'anonymous',
              displayName: d.creatorDisplayName || 'Creator',
              username: d.creatorUsername || 'creator',
              avatarUrl: d.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              followerCount: 0
            },
            likesCount: d.likesCount || 0,
            savesCount: d.savesCount || 0,
            viewsCount: d.viewsCount || 1,
            copiesCount: d.copiesCount || 0,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Just now'
          });
        }
      });
      setSavedPosts(matched);
      setLoadingDb(false);
    }, (err) => {
      console.error("Error fetching saved gallery:", err);
      setLoadingDb(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleUnsave = (id: string) => {
    setSavedPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <Bookmark size={28} className={styles.icon} fill="currentColor" />
          <h1 className={styles.title}>Saved Prompts Library</h1>
        </div>
        <p className={styles.subtitle}>
          Your private bookmarked AI generative structures and reference artwork.
        </p>
      </header>

      {!user && !authLoading ? (
        <div className={styles.emptyState}>
          <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
          <h3>Authentication Required</h3>
          <p>To view your saved bookmarks across devices, please sign in with Google.</p>
          <button className="btn-solid" onClick={signInWithGoogle}>
            Sign In with Google
          </button>
        </div>
      ) : loadingDb || authLoading ? (
        <div className={styles.emptyState}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <h3>Synchronizing your bookmarks...</h3>
          <p>Fetching saved prompts from live Firestore database.</p>
        </div>
      ) : savedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={48} className={styles.emptyIcon} />
          <h3>Your saved library is empty</h3>
          <p>While browsing the discovery feed, click the bookmark icon on any card to preserve it here!</p>
          <Link to="/" className="btn-solid" style={{ textDecoration: 'none' }}>Explore Discovery Feed</Link>
        </div>
      ) : (
        <section className={styles.grid}>
          {savedPosts.map(post => (
            <PromptCard key={post.id} post={post} onSave={handleUnsave} />
          ))}
        </section>
      )}
    </main>
  );
}
