"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

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
}

interface AuthContextType {
  user: User | null;
  profile: CreatorProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync profile from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);
          
          if (userSnapshot.exists()) {
            setProfile(userSnapshot.data() as CreatorProfile);
          } else {
            // Create initial user profile in Firestore
            const baseUsername = currentUser.email 
              ? currentUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
              : `creator_${currentUser.uid.substring(0, 6)}`;
            
            const newProfile: CreatorProfile = {
              uid: currentUser.uid,
              email: currentUser.email || undefined,
              displayName: currentUser.displayName || 'Unnamed Creator',
              username: baseUsername,
              avatarUrl: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              followerCount: 0,
              followingCount: 0,
              totalViews: 0,
              createdAt: serverTimestamp(),
            };
            
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error syncing Firestore user profile:", error);
          // Fallback in case Firestore rules or offline network block sync
          setProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'AI Creator',
            username: currentUser.email ? currentUser.email.split('@')[0] : 'creator',
            avatarUrl: currentUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: 0,
            followingCount: 0,
            totalViews: 0,
            createdAt: new Date(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
