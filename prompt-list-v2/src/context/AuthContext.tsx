import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface CreatorProfile {
  uid: string;
  email?: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  totalViews: number;
  createdAt?: any;
  isProfileComplete?: boolean;
  monetizationStatus?: 'ineligible' | 'pending_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  isBanned?: boolean;
  subscriptionStatus?: 'active' | 'canceled' | 'expired' | string;
}

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfileState: (data: Partial<CreatorProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateProfileState: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | undefined;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = undefined;
      }

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          const checkSnap = await getDoc(userDocRef);
          if (!checkSnap.exists()) {
            const baseUsername = currentUser.email 
              ? currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 100)
              : `creator_${currentUser.uid.substring(0, 6)}`;
            
            const newProfile: CreatorProfile = {
              uid: currentUser.uid,
              email: currentUser.email || undefined,
              displayName: currentUser.displayName || '',
              username: baseUsername,
              avatarUrl: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              followerCount: 0,
              followingCount: 0,
              totalViews: 0,
              createdAt: serverTimestamp(),
              isProfileComplete: false,
              monetizationStatus: 'ineligible',
              isBanned: false,
            };
            
            await setDoc(userDocRef, newProfile);
          }
        } catch (error) {
          console.error("Error initializing user profile:", error);
        }

        profileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as CreatorProfile;
            if (data.isBanned) {
              alert("Your account has been suspended by an administrator due to policy violations.");
              fbSignOut(auth);
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }
            setProfile(data);
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email || undefined,
              displayName: currentUser.displayName || 'AI Creator',
              username: currentUser.email ? currentUser.email.split('@')[0] : 'creator',
              avatarUrl: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              followerCount: 0,
              followingCount: 0,
              totalViews: 0,
              createdAt: new Date(),
              isProfileComplete: true,
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Error listening to profile snapshot:", err);
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Authentication failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const updateProfileState = async (newData: Partial<CreatorProfile>) => {
    if (!user) return;
    const nextProfile = { ...(profile || {}), ...newData } as CreatorProfile;
    setProfile(nextProfile);
    try {
      await setDoc(doc(db, 'users', user.uid), newData, { merge: true });
    } catch (e) {
      console.error("Failed to merge profile updates:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut, updateProfileState }}>
      {children}
    </AuthContext.Provider>
  );
};

