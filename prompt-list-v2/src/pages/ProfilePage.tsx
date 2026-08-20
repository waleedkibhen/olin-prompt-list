import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '@/context/AuthContext';
import { db, storage, auth } from '@/lib/firebase';
import { doc, updateDoc, collection, collectionGroup, query, where, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile, deleteUser } from 'firebase/auth';
import { User, ShieldAlert, Sparkles, Upload, Box, MessageSquarePlus, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import FeedbackModal from '@/components/FeedbackModal';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';

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

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [socials, setSocials] = useState({
    pinterest: '',
    youtube: '',
    twitter: '',
    instagram: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isSubscriber, setIsSubscriber] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    if (profile || user) {
      setDisplayName(profile?.displayName || user?.displayName || '');
      setUsername(profile?.username || '');
      setEmail(profile?.email || user?.email || '');
      setBio(profile?.bio || '');
      setAvatarUrl(profile?.avatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
      setSocials({
        pinterest: profile?.socialLinks?.pinterest || '',
        youtube: profile?.socialLinks?.youtube || '',
        twitter: profile?.socialLinks?.twitter || '',
        instagram: profile?.socialLinks?.instagram || ''
      });
    }
    const subStatus = user ? localStorage.getItem(`olin_subscription_${user.uid}`) : null;
    setIsSubscriber(
      profile?.isPremium === true || 
      profile?.subscriptionStatus === 'active' || 
      subStatus === 'active' ||
      localStorage.getItem('olin_recent_success') === 'true'
    );
  }, [profile, user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box size={26} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
        <AlertTriangle size={48} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Account Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Please sign in with your Google account to access your profile settings and subscription management.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setPreviewUrl(URL.createObjectURL(f));
    }
  };

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 500;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed'));
        }, 'image/jpeg', 0.85);
      };
      img.onerror = () => reject(new Error('Could not read image'));
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!user) return;

    const cleanedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanedUsername || cleanedUsername.length < 3) {
      setErrorMsg("Username must be at least 3 characters alphanumeric.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (cleanedUsername !== profile?.username) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', cleanedUsername));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setErrorMsg(`The username @${cleanedUsername} is already taken by another creator.`);
          setIsSubmitting(false);
          return;
        }
      }

      let newAvatarUrl = avatarUrl;
      if (selectedFile) {
        const compressedBlob = await compressImage(selectedFile);
        const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_profile.jpg`);
        await uploadBytes(storageRef, compressedBlob);
        newAvatarUrl = await getDownloadURL(storageRef);
      }

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: displayName.trim(),
        username: cleanedUsername,
        avatarUrl: newAvatarUrl,
        email: email.trim(),
        bio: bio.trim(),
        socialLinks: socials
      });

      // Sync directly with Firebase Auth currentUser
      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, {
            displayName: displayName.trim(),
            photoURL: newAvatarUrl
          });
        } catch (authErr) {
          console.error("Error syncing Firebase Auth profile:", authErr);
        }
      }

      // Propagate profile identity across all existing posts authored by this creator
      try {
        const postsRef = collection(db, 'posts');
        const userPostsQuery = query(postsRef, where('creatorId', '==', user.uid));
        const userPostsSnap = await getDocs(userPostsQuery);

        if (!userPostsSnap.empty) {
          const batch = writeBatch(db);
          userPostsSnap.forEach((postDoc) => {
            batch.update(postDoc.ref, {
              creatorDisplayName: displayName.trim(),
              creatorUsername: cleanedUsername,
              creatorAvatarUrl: newAvatarUrl
            });
          });
          await batch.commit();
          console.log(`Propagated identity update to ${userPostsSnap.size} historical posts.`);
        }
        
        // Propagate profile identity across all existing comments authored by this creator
        const commentsQuery = query(collectionGroup(db, 'comments'), where('userId', '==', user.uid));
        const userCommentsSnap = await getDocs(commentsQuery);
        
        if (!userCommentsSnap.empty) {
          const batch = writeBatch(db);
          userCommentsSnap.forEach((commentDoc) => {
            batch.update(commentDoc.ref, {
              authorName: displayName.trim(),
              authorAvatar: newAvatarUrl
            });
          });
          await batch.commit();
          console.log(`Propagated identity update to ${userCommentsSnap.size} historical comments.`);
        }
      } catch (propErr) {
        console.error("Error propagating identity to historical posts/comments:", propErr);
      }

      setAvatarUrl(newAvatarUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccessMsg("Profile settings and identity successfully updated!");
      setIsSubmitting(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setErrorMsg("Failed to update profile details. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleToggleSubscription = () => {
    if (!user) return;
    if (isSubscriber) {
      window.open('https://whop.com/orders', '_blank', 'noopener,noreferrer');
    } else {
      navigate('/pricing');
    }
  };

  const isAdmin = user.email === 'wisecrafts81@gmail.com';

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleArea}>
          <div>
            <h1 style={{ fontWeight: 400, fontSize: '1.5rem' }}>Settings</h1>
          </div>
        </div>
      </header>

      <div className={styles.gridSection}>
        <form className={styles.card} onSubmit={handleSaveProfile}>
          {/* Removed Creator Profile Identity Header */}

          {errorMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderRadius: '8px', fontSize: '0.88rem', border: '1px solid #f43f5e' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px', fontSize: '0.88rem', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className={styles.avatarSection}>
            <img 
              src={previewUrl || avatarUrl} 
              alt="Avatar Preview" 
              className={styles.avatarPreview}
            />
            <div className={styles.avatarControls}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Profile Picture</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>JPG or PNG. Will be automatically optimized to circle ratio.</span>
              <label className={styles.fileLabel}>
                <Upload size={14} />
                <span>Upload New Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="displayName">Display Name</label>
            <input 
              id="displayName"
              type="text" 
              className={styles.formInput} 
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              required
              placeholder="e.g. AI Wizard"
            />
            {displayName.length >= 30 && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (30/30)</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '0', color: 'var(--text-secondary)', fontWeight: 400 }}>@</span>
              <input 
                id="username"
                type="text" 
                className={styles.formInput} 
                style={{ paddingLeft: '1.2rem', width: '100%' }}
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                maxLength={15}
                required
                placeholder="username_handle"
              />
            </div>
            {username.length >= 15 && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (15/15)</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className={styles.formInput} 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="e.g. wizard@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Creator Bio (Optional)</label>
            <textarea 
              id="bio"
              className={styles.formInput} 
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={160}
              placeholder="Tell the community a bit about your style, inspirations, or creative focus..."
            />
            {bio.length >= 160 && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (160/160)</span>
            )}
          </div>

          <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500, letterSpacing: '1px' }}>
              Social Links <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Optional)</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="instagram" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <InstagramIcon size={16} /> Instagram Profile Link
            </label>
            <input 
              id="instagram"
              type="url" 
              className={styles.formInput} 
              value={socials.instagram}
              onChange={e => setSocials(prev => ({ ...prev, instagram: e.target.value.trim() }))}
              placeholder="https://instagram.com/wisedev"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="twitter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TwitterIcon size={16} /> Twitter / X Profile Link
            </label>
            <input 
              id="twitter"
              type="url" 
              className={styles.formInput} 
              value={socials.twitter}
              onChange={e => setSocials(prev => ({ ...prev, twitter: e.target.value.trim() }))}
              placeholder="https://x.com/vvisedev"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="pinterest" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PinterestIcon size={16} /> Pinterest Profile Link
            </label>
            <input 
              id="pinterest"
              type="url" 
              className={styles.formInput} 
              value={socials.pinterest}
              onChange={e => setSocials(prev => ({ ...prev, pinterest: e.target.value.trim() }))}
              placeholder="https://pin.it/6hgKLJ7wT"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="youtube" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <YoutubeIcon size={16} /> YouTube Channel Link
            </label>
            <input 
              id="youtube"
              type="url" 
              className={styles.formInput} 
              value={socials.youtube}
              onChange={e => setSocials(prev => ({ ...prev, youtube: e.target.value.trim() }))}
              placeholder="https://youtube.com/@wisedev"
            />
          </div>

          <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
            {isSubmitting ? <Box size={16} className="global-box-spin" /> : 'Save Profile Changes'}
          </button>
        </form>

        <div className={styles.dangerZone}>
          <div className={styles.dangerHeader}>
            <Trash2 size={20} className={styles.dangerIcon} />
            <div>
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
              <p className={styles.dangerSubtitle}>Permanently delete your account and all associated data.</p>
            </div>
          </div>
          <div className={styles.dangerBody}>
            <p>Once you delete your account, there is no going back. All of your prompts, images, saved items, and profile data will be permanently wiped from our servers.</p>
            <button 
              className={styles.btnDelete} 
              disabled={isDeleting}
              onClick={async () => {
                if (!window.confirm("Are you absolutely sure you want to delete your account? This will permanently delete your profile, prompts, and all associated data. This action cannot be undone.")) {
                  return;
                }
                
                setIsDeleting(true);
                try {
                  if (user) {
                    await deleteDoc(doc(db, 'users', user.uid));
                    await deleteUser(user);
                    toast.success("Account successfully deleted. All data has been wiped.");
                    navigate('/');
                  }
                } catch (err: any) {
                  console.error("Error deleting account:", err);
                  if (err.code === 'auth/requires-recent-login') {
                    toast.error("Security requirement: Please sign out and sign back in to verify your identity before deleting your account.");
                  } else {
                    toast.error("Failed to delete account. Please try again later.");
                  }
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? <Box size={16} className="global-box-spin" /> : 'Delete Account and Data'}
            </button>
          </div>
        </div>

        {/* Removed Admin, Subscription, and Support cards */}
      </div>

      {isSupportOpen && (
        <FeedbackModal onClose={() => setIsSupportOpen(false)} />
      )}
    </div>
  );
}
