"use client";

import React, { useEffect, useState } from 'react';
import styles from './following.module.css';
import Navbar from '@/components/Navbar';
import PromptCard from '@/components/PromptCard';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost, Creator } from '@/lib/mockData';
import { Users, Sparkles, Layers, Loader2, AlertTriangle } from 'lucide-react';

export default function FollowingHubPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [followingPosts, setFollowingPosts] = useState<PromptPost[]>([]);
  const [followedCreators, setFollowedCreators] = useState<Creator[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    let currentFollowIds: string[] = [];
    if (user && typeof window !== 'undefined') {
      currentFollowIds = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    } else {
      setLoadingDb(false);
      return;
    }

    if (currentFollowIds.length === 0) {
      setFollowingPosts([]);
      setFollowedCreators([]);
      setLoadingDb(false);
      return;
    }

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matchedPosts: PromptPost[] = [];
      const creatorMap = new Map<string, Creator>();

      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const creatorId = d.creatorId || 'anonymous';

        if (currentFollowIds.includes(creatorId)) {
          const creatorObj: Creator = {
            uid: creatorId,
            displayName: d.creatorDisplayName || 'Creator',
            username: d.creatorUsername || 'creator',
            avatarUrl: d.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: d.creatorFollowers || 1
          };
          if (!creatorMap.has(creatorId)) creatorMap.set(creatorId, creatorObj);

          matchedPosts.push({
            id: docSnap.id,
            title: d.title || 'Untitled',
            description: d.description || '',
            promptText: d.promptText || '',
            negativePrompt: d.negativePrompt || null,
            imageUrls: d.imageUrls || [],
            model: d.model || 'Midjourney V6',
            styleTag: d.styleTag || 'Community',
            categories: d.categories || [],
            creator: creatorObj,
            likesCount: d.likesCount || 0,
            savesCount: d.savesCount || 0,
            viewsCount: d.viewsCount || 1,
            copiesCount: d.copiesCount || 0,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Just now'
          });
        }
      });

      setFollowedCreators(Array.from(creatorMap.values()));
      setFollowingPosts(matchedPosts);
      setLoadingDb(false);
    }, (err) => {
      console.error("Error syncing following feed:", err);
      setLoadingDb(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleUnfollow = (creatorUid: string) => {
    if (!user) return;
    const currentFollows: string[] = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    const next = currentFollows.filter(id => id !== creatorUid);
    localStorage.setItem(`following_${user.uid}`, JSON.stringify(next));

    setFollowedCreators(prev => prev.filter(c => c.uid !== creatorUid));
    setFollowingPosts(prev => prev.filter(p => p.creator.uid !== creatorUid));
  };

  return (
    <>
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleWrapper}>
            <Users size={28} className={styles.icon} />
            <h1 className={styles.title}>Followed Creators Community Hub</h1>
          </div>
          <p className={styles.subtitle}>
            Exclusive real-time timeline of new artwork and generative parameters published by creators you follow.
          </p>
        </header>

        {!user && !authLoading ? (
          <div className={styles.emptyState}>
            <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
            <h3>Google Authentication Required</h3>
            <p>Sign in with Google to follow leading AI artists and build your personalized discovery timeline.</p>
            <button className="btn-solid" onClick={signInWithGoogle}>
              Sign In with Google
            </button>
          </div>
        ) : loadingDb || authLoading ? (
          <div className={styles.emptyState}>
            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
            <h3>Synchronizing community feed...</h3>
            <p>Loading recent uploads from your followed creators.</p>
          </div>
        ) : followedCreators.length === 0 ? (
          <div className={styles.emptyState}>
            <Layers size={48} className={styles.emptyIcon} />
            <h3>You are not following any creators yet</h3>
            <p>While exploring artwork, click "+ Follow Creator" on any card or detail preview to subscribe to their portfolio!</p>
            <a href="/" className="btn-solid">Explore AI Marketplace</a>
          </div>
        ) : (
          <>
            {/* Active Followed Artists Showcase */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Followed Artists ({followedCreators.length})</h3>
            <div className={styles.creatorsRow}>
              {followedCreators.map(creator => (
                <div key={creator.uid} className={styles.creatorCard}>
                  <img src={creator.avatarUrl} alt={creator.displayName} className={styles.avatar} />
                  <div>
                    <div className={styles.name}>{creator.displayName}</div>
                    <div className={styles.handle}>@{creator.username}</div>
                  </div>
                  <button 
                    className="btn-outline" 
                    onClick={() => handleUnfollow(creator.uid)}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', width: '100%' }}
                  >
                    ✓ Following
                  </button>
                </div>
              ))}
            </div>

            {/* Exclusive Creators Timeline Grid */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: '#10b981' }} />
              <span>Latest Uploads from Followed Artists ({followingPosts.length})</span>
            </h3>
            <section className={styles.grid}>
              {followingPosts.map(post => (
                <PromptCard key={post.id} post={post} />
              ))}
            </section>
          </>
        )}
      </main>
    </>
  );
}
