import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { Box, AlertCircle } from 'lucide-react';
import PromptCard from '@/components/PromptCard';

export default function PostDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();

  const [post, setPost] = useState<PromptPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // Increment view count in the background
    const postRef = doc(db, 'posts', id);
    updateDoc(postRef, { viewsCount: increment(1) }).catch(() => {});

    const fetchPost = async () => {
      try {
        const snap = await getDoc(postRef);
        if (snap.exists()) {
          const d = snap.data();
          setPost({
            id: snap.id,
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
      } catch (e) {
        console.error("Error loading post:", e);
      }
      setLoading(false);
    };
    
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post?.title) {
      document.title = `${post.title} - Olin's Prompt List`;
    }
  }, [post?.title]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: 'var(--text-secondary)' }}>
        <Box size={36} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
        <span>Loading artwork...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', color: 'var(--text-secondary)' }}>
        <AlertCircle size={48} color="var(--text-muted)" />
        <h2>Post not found</h2>
        <button onClick={() => navigate('/')} style={{ padding: '0.5rem 1rem', background: 'var(--bg-accent)', border: 'none', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>
          Return Home
        </button>
      </div>
    );
  }

  return (
    <>
      <PromptCard 
        post={post} 
        defaultOpen={true} 
        onCloseOverride={() => {
          navigate('/');
        }}
      />
    </>
  );
}
