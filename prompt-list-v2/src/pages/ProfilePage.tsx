import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { useAuth } from '@/context/AuthContext';
import { db, storage, auth } from '@/lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { User, ShieldAlert, Sparkles, Upload, Loader2, MessageSquarePlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import FeedbackModal from '@/components/FeedbackModal';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
        <Loader2 size={26} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading account details...</span>
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
        bio: bio.trim()
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
      } catch (propErr) {
        console.error("Error propagating identity to historical posts:", propErr);
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

          <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Profile Changes'}
          </button>
        </form>

        {/* Removed Admin, Subscription, and Support cards */}
      </div>

      {isSupportOpen && (
        <FeedbackModal onClose={() => setIsSupportOpen(false)} />
      )}
    </div>
  );
}
