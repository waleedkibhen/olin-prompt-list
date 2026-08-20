import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import PromptCard from './PromptCard';
import styles from './DiscoveryFeed.module.css';

export default function DiscoverMore({ currentPostId }: { currentPostId: string }) {
  const [posts, setPosts] = useState<PromptPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snap = await getDocs(q);
        const items: PromptPost[] = [];
        snap.forEach(docSnap => {
          if (docSnap.id !== currentPostId && items.length < 4) {
            const d = docSnap.data() as any;
            items.push({
              id: docSnap.id,
              title: d.title || 'Untitled',
              description: d.description || '',
              promptText: d.promptText || '',
              prompts: d.prompts || undefined,
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
        });
        const shuffled = items.sort(() => 0.5 - Math.random());
        setPosts(shuffled.slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch discover more posts:', err);
      }
    };
    fetchPosts();
  }, [currentPostId]);

  if (posts.length === 0) return null;

  return (
    <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)', width: '100%' }}>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Explore More</h3>
      <div className={styles.feedGrid}>
        {posts.map(p => (
          <PromptCard key={p.id} post={p} defaultOpen={false} />
        ))}
      </div>
    </div>
  );
}

