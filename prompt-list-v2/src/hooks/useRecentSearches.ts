import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface RecentSearch {
  term: string;
  image: string;
  timestamp: number;
}

const LOCAL_STORAGE_KEY = 'olin_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const { user } = useAuth();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial searches
  useEffect(() => {
    let isMounted = true;

    const loadSearches = async () => {
      let searches: RecentSearch[] = [];

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            searches = userDoc.data().recentSearches || [];
          }
        } catch (error) {
          console.error('Error loading recent searches from Firestore:', error);
          // Fallback to local storage
          const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localData) searches = JSON.parse(localData);
        }
      } else {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) searches = JSON.parse(localData);
      }

      if (isMounted) {
        setRecentSearches(searches);
        setIsLoaded(true);
      }
    };

    loadSearches();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const addRecentSearch = useCallback(async (term: string, image: string) => {
    if (!term.trim()) return;

    setRecentSearches(prev => {
      // Remove if it already exists to move it to the top
      const filtered = prev.filter(s => s.term.toLowerCase() !== term.toLowerCase());
      
      const newSearch: RecentSearch = {
        term: term.trim(),
        image: image || '', // Will be empty string if blank
        timestamp: Date.now()
      };

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Save to local storage always as a fallback/sync
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      // Save to Firestore if logged in
      if (user) {
        updateDoc(doc(db, 'users', user.uid), {
          recentSearches: updated
        }).catch(err => console.error("Error saving recent search:", err));
      }

      return updated;
    });
  }, [user]);

  const removeRecentSearch = useCallback(async (term: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s.term.toLowerCase() !== term.toLowerCase());

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

      if (user) {
        updateDoc(doc(db, 'users', user.uid), {
          recentSearches: updated
        }).catch(err => console.error("Error removing recent search:", err));
      }

      return updated;
    });
  }, [user]);

  return {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    isLoaded
  };
}
