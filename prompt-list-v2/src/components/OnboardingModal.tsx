import React, { useState, useEffect, useRef } from 'react';
import styles from './OnboardingModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { sendNotification } from '@/lib/notifications';
import { Sparkles, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingModal() {
  const { user, profile, updateProfileState } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setUsername(profile.username || '');
      setAvatarUrl(profile.avatarUrl || user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    }
  }, [profile, user]);

  useEffect(() => {
    if (!username.trim() || username === profile?.username) {
      setUsernameError(null);
      setIsUsernameAvailable(true);
      return;
    }

    const clean = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.length < 3) {
      setUsernameError("Username must be at least 3 alphanumeric characters.");
      setIsUsernameAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const q = query(collection(db, "users"), where("username", "==", clean));
        const snap = await getDocs(q);
        let exists = false;
        snap.forEach(docSnap => {
          if (docSnap.id !== user?.uid) exists = true;
        });

        if (exists) {
          setUsernameError("This username is already taken by another creator.");
          setIsUsernameAvailable(false);
        } else {
          setUsernameError(null);
          setIsUsernameAvailable(true);
        }
      } catch (err) {
        console.error("Error validating username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, user?.uid, profile?.username]);

  if (!user || !profile || profile.isProfileComplete !== false) {
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a supported image format (JPG/PNG/WEBP).");
      return;
    }

    setUploadingAvatar(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setAvatarUrl(downloadUrl);
    } catch (err: any) {
      toast.error(`Failed to upload avatar: ${err.message}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a valid Display Name.");
      return;
    }
    if (!isUsernameAvailable || isCheckingUsername) {
      toast.error("Please select a valid, available username before proceeding.");
      return;
    }

    setIsSubmitting(true);
    const cleanUser = username.toLowerCase().replace(/[^a-z0-9]/g, '');

    try {
      await updateProfileState({
        displayName: displayName.trim(),
        username: cleanUser,
        avatarUrl,
        isProfileComplete: true
      });

      await sendNotification(
        user.uid,
        "Welcome to Olin Prompt List!",
        "Your creator profile is set up. Start uploading prompts and reach 50 copy milestones to apply for monetization!",
        "system"
      );
    } catch (err: any) {
      toast.error(`Failed to complete onboarding: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={e => e.stopPropagation()}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>
            <Sparkles size={22} style={{ color: 'var(--accent-color)' }} />
            <span>Complete Your Creator Profile</span>
          </h2>
          <p>Before entering the community marketplace, customize your public creator identity and avatar.</p>
        </header>

        <form className={styles.formBody} onSubmit={handleSubmit}>
          <div className={styles.avatarPickerSection}>
            <div className={styles.avatarPreviewWrapper} onClick={() => !uploadingAvatar && fileInputRef.current?.click()} title="Click to upload custom avatar">
              <img src={avatarUrl} alt="Avatar Preview" className={styles.avatarImg} />
              <div className={styles.avatarOverlay}>
                {uploadingAvatar ? <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={22} />}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                style={{ display: 'none' }}
                disabled={uploadingAvatar}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click circular photo to change picture</span>
          </div>

          <div className={styles.fieldGroup}>
            <label>Display Name</label>
            <input 
              type="text" 
              placeholder="Your professional artistic name" 
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
              required 
            />
            {displayName.length >= 30 && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (30/30)</span>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label>Unique Username</label>
            <div className={styles.usernameInputRow}>
              <span className={styles.atSymbol}>@</span>
              <input 
                type="text" 
                placeholder="alphanumeric_username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={15}
                required 
              />
            </div>
            {username.length >= 15 && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.25rem' }}>Character limit reached (15/15)</span>
            )}
            {isCheckingUsername ? (
              <span className={styles.validationHint} style={{ color: 'var(--text-secondary)' }}>
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Checking username availability...</span>
              </span>
            ) : usernameError ? (
              <span className={`${styles.validationHint} ${styles.errorText}`}>
                <AlertCircle size={14} />
                <span>{usernameError}</span>
              </span>
            ) : username.trim() ? (
              <span className={`${styles.validationHint} ${styles.successText}`}>
                <CheckCircle2 size={14} />
                <span>Username is available!</span>
              </span>
            ) : null}
          </div>

          <button 
            type="submit" 
            className={`btn-solid ${styles.submitBtn}`}
            disabled={isSubmitting || isCheckingUsername || !isUsernameAvailable || !displayName.trim()}
          >
            {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
            <span>Save &amp; Enter Marketplace</span>
          </button>
        </form>
      </div>
    </div>
  );
}
