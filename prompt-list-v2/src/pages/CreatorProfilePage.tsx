import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CreatorProfilePage.module.css';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { PromptPost } from '@/lib/mockData';
import { useAuth } from '@/context/AuthContext';
import { Share, AlertTriangle, Plus, Check, Box } from 'lucide-react';
import PromptCard from '@/components/PromptCard';
import toast from 'react-hot-toast';

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.608 0 12.017 0z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

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
            prompts: d.prompts || undefined,
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
          try {
            const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
            setIsFollowing(followedArr.includes(userData.id));
          } catch {}
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
    try {
      const followedArr = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
      const nextArr = nextVal ? [...followedArr, creatorUser.id] : followedArr.filter((id: string) => id !== creatorUser.id);
      localStorage.setItem(`following_${user.uid}`, JSON.stringify(nextArr));
    } catch {}

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
    toast.success('Profile link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Box size={32} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
        <span>Loading creator profile...</span>
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
              {creatorUser.socialLinks?.instagram && (
                <a href={creatorUser.socialLinks.instagram.startsWith('http') ? creatorUser.socialLinks.instagram : `https://${creatorUser.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className={styles.btnShareIcon} title="Instagram">
                  <InstagramIcon size={16} />
                </a>
              )}
              {creatorUser.socialLinks?.twitter && (
                <a href={creatorUser.socialLinks.twitter.startsWith('http') ? creatorUser.socialLinks.twitter : `https://${creatorUser.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className={styles.btnShareIcon} title="Twitter / X">
                  <TwitterIcon size={16} />
                </a>
              )}
              {creatorUser.socialLinks?.pinterest && (
                <a href={creatorUser.socialLinks.pinterest.startsWith('http') ? creatorUser.socialLinks.pinterest : `https://${creatorUser.socialLinks.pinterest}`} target="_blank" rel="noopener noreferrer" className={styles.btnShareIcon} title="Pinterest">
                  <PinterestIcon size={16} />
                </a>
              )}
              {creatorUser.socialLinks?.youtube && (
                <a href={creatorUser.socialLinks.youtube.startsWith('http') ? creatorUser.socialLinks.youtube : `https://${creatorUser.socialLinks.youtube}`} target="_blank" rel="noopener noreferrer" className={styles.btnShareIcon} title="YouTube">
                  <YoutubeIcon size={16} />
                </a>
              )}
              
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
                <Share size={16} strokeWidth={2.5} />
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
