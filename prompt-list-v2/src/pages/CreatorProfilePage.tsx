import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CreatorProfilePage.module.css';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { PromptPost } from '@/lib/mockData';
import PromptCard from '@/components/PromptCard';
import { Loader2, AlertTriangle, Share, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  
  const [creatorUser, setCreatorUser] = useState<any>(null);
  const [creatorPosts, setCreatorPosts] = useState<PromptPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);

  // Follow states (localStorage mock logic to match PromptCard)
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch user by username ONLY
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('username', '==', username.toLowerCase()));
        const userSnap = await getDocs(userQuery);

        if (userSnap.empty) {
          setError("Creator not found");
          setLoading(false);
          return;
        }

        const userData = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() } as any;
        setCreatorUser(userData);

        // 2. Fetch posts by this creator using their exact ID
        const postsRef = collection(db, 'posts');
        const postsQuery = query(postsRef, where('creatorId', '==', userData.id));
        const postsSnap = await getDocs(postsQuery);
        
        const items: PromptPost[] = [];
        postsSnap.forEach(docSnap => {
          const d = docSnap.data();
          items.push({
            id: docSnap.id,
            title: d.title || 'Untitled',
            promptText: d.promptText || '',
            imageUrls: d.imageUrls || [],
            model: d.model || 'Midjourney V6',
            styleTag: d.styleTag || 'Community',
            categories: d.categories || [],
            creator: {
              uid: d.creatorId,
              displayName: d.creatorDisplayName || 'Creator',
              username: d.creatorUsername || 'creator',
              avatarUrl: d.creatorAvatarUrl,
              followerCount: 0
            },
            likesCount: d.likesCount || 0,
            savesCount: d.savesCount || 0,
            viewsCount: d.viewsCount || 0,
            copiesCount: d.copiesCount || 0,
            isPaid: d.isPaid || false,
            price: d.price || 0,
            monetizationType: d.monetizationType || 'free',
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Recently'
          });
        });
        
        setCreatorPosts(items.sort((a, b) => b.likesCount - a.likesCount));
        
        let views = 0;
        let likes = 0;
        items.forEach(p => {
          views += p.viewsCount || 0;
          likes += p.likesCount || 0;
        });
        setTotalViews(views);
        setTotalLikes(likes);

        // 3. Fetch real follower count from follows collection
        const followsQuery = query(collection(db, 'follows'), where('followingId', '==', userData.id));
        const followsSnap = await getDocs(followsQuery);
        setFollowerCount(followsSnap.size);

        // 4. Check if current user is following (using our localStorage mock for now)
        if (user) {
          const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
          setIsFollowing(followedArr.includes(userData.id));
        }

      } catch (err) {
        console.error("Error fetching creator profile:", err);
        setError("Failed to load profile");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username, user]);

  const toggleFollow = async () => {
    if (!user || !creatorUser) return;
    const nextVal = !isFollowing;
    setIsFollowing(nextVal);
    
    // Fallback to local storage like PromptCard
    const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
    const nextArr = nextVal ? [...followedArr, creatorUser.id] : followedArr.filter((id: string) => id !== creatorUser.id);
    localStorage.setItem(`following_${user.uid}`, JSON.stringify(nextArr));

    // Optional: Optimistically update visual follower count
    setFollowerCount(prev => nextVal ? prev + 1 : Math.max(0, prev - 1));

    // Update Firestore
    const followDocId = `${user.uid}_${creatorUser.id}`;
    try {
      if (nextVal) {
        await setDoc(doc(db, 'follows', followDocId), {
          followerId: user.uid,
          followingId: creatorUser.id,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(doc(db, 'follows', followDocId));
      }
    } catch (err) {
      console.error("Failed to update follow status in Firestore", err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading creator profile...</p>
      </div>
    );
  }

  if (error || !creatorUser) {
    return (
      <div className={styles.errorState}>
        <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
        <h2>{error || "Profile not found"}</h2>
      </div>
    );
  }

  return (
    <main className={styles.profileContainer}>
      <header className={styles.profileHeader}>
        <div className={styles.topSection}>
          <div className={styles.avatarWrapper}>
            <img 
              src={creatorUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
              alt={creatorUser.displayName} 
              className={styles.avatar} 
            />
          </div>
          
          <div className={styles.infoCol}>
            <h1 className={styles.name}>{creatorUser.username}</h1>
            
            {creatorUser.bio && (
              <p className={styles.bio}>{creatorUser.bio}</p>
            )}
            
            <div className={styles.actions}>
              {user?.uid !== creatorUser.id && (
                <button 
                  className={isFollowing ? styles.btnFollowing : styles.btnFollow} 
                  onClick={toggleFollow}
                  title={isFollowing ? "Unfollow" : "Follow"}
                >
                  {isFollowing ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                </button>
              )}
              <button className={styles.btnShareIcon} onClick={handleShare} title="Share Profile">
                <Share size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.statsRow}>
          <div className={styles.statMini}><strong>{followerCount >= 1000 ? (followerCount / 1000).toFixed(1) + 'k' : followerCount}</strong> Followers</div>
          <div className={styles.statMini}><strong>{creatorPosts.length}</strong> Posts</div>
          <div className={styles.statMini}><strong>{totalViews >= 1000 ? (totalViews / 1000).toFixed(1) + 'k' : totalViews}</strong> Views</div>
          <div className={styles.statMini}><strong>{totalLikes >= 1000 ? (totalLikes / 1000).toFixed(1) + 'k' : totalLikes}</strong> Likes</div>
        </div>
      </header>

      {/* Masonry Grid of Feed Cards */}
      <div className="masonry-grid">
        {creatorPosts.map(post => (
          <div className="masonry-item" key={post.id}>
            <PromptCard 
              post={post}
              onLike={() => {}}
              onSave={() => {}}
            />
          </div>
        ))}
      </div>
    </main>
  );
}
