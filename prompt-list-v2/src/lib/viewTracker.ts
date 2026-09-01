import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VIEWS_STORAGE_KEY = 'olin_viewed_posts';
const COOLDOWN_HOURS = 24;

interface ViewedPosts {
  [postId: string]: number; // timestamp in milliseconds
}

// In-memory fallback if localStorage and sessionStorage are restricted or throw SecurityError in in-app webviews
const inMemoryViewedPosts: ViewedPosts = {};

function safeGetStorage(type: 'local' | 'session'): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    const storage = type === 'local' ? window.localStorage : window.sessionStorage;
    const testKey = `__olin_test_${Math.random()}`;
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return storage;
  } catch {
    return null;
  }
}

export function hasViewedRecently(postId: string): boolean {
  if (!postId) return true;

  try {
    const now = Date.now();

    // 1. Check in-memory first
    const memTimestamp = inMemoryViewedPosts[postId];
    if (memTimestamp && (now - memTimestamp) / (1000 * 60 * 60) < COOLDOWN_HOURS) {
      return true;
    }

    // 2. Check sessionStorage
    const sessionStore = safeGetStorage('session');
    if (sessionStore) {
      const stored = sessionStore.getItem(VIEWS_STORAGE_KEY);
      if (stored) {
        const viewedPosts: ViewedPosts = JSON.parse(stored);
        const lastViewed = viewedPosts[postId];
        if (lastViewed && (now - lastViewed) / (1000 * 60 * 60) < COOLDOWN_HOURS) {
          inMemoryViewedPosts[postId] = lastViewed;
          return true;
        }
      }
    }

    // 3. Check localStorage
    const localStore = safeGetStorage('local');
    if (localStore) {
      const stored = localStore.getItem(VIEWS_STORAGE_KEY);
      if (stored) {
        const viewedPosts: ViewedPosts = JSON.parse(stored);
        const lastViewed = viewedPosts[postId];
        if (lastViewed && (now - lastViewed) / (1000 * 60 * 60) < COOLDOWN_HOURS) {
          inMemoryViewedPosts[postId] = lastViewed;
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    // If any error occurs reading storage, allow the view so tracking is not blocked
    console.warn('View history check fallback:', error);
    return false;
  }
}

export function recordView(postId: string): void {
  if (!postId) return;

  const now = Date.now();
  inMemoryViewedPosts[postId] = now;

  const cleanPosts = (posts: ViewedPosts): ViewedPosts => {
    const cleaned: ViewedPosts = {};
    for (const [id, timestamp] of Object.entries(posts)) {
      if ((now - timestamp) / (1000 * 60 * 60) < COOLDOWN_HOURS) {
        cleaned[id] = timestamp;
      }
    }
    cleaned[postId] = now;
    return cleaned;
  };

  try {
    const sessionStore = safeGetStorage('session');
    if (sessionStore) {
      const stored = sessionStore.getItem(VIEWS_STORAGE_KEY);
      const parsed: ViewedPosts = stored ? JSON.parse(stored) : {};
      sessionStore.setItem(VIEWS_STORAGE_KEY, JSON.stringify(cleanPosts(parsed)));
    }
  } catch {}

  try {
    const localStore = safeGetStorage('local');
    if (localStore) {
      const stored = localStore.getItem(VIEWS_STORAGE_KEY);
      const parsed: ViewedPosts = stored ? JSON.parse(stored) : {};
      localStore.setItem(VIEWS_STORAGE_KEY, JSON.stringify(cleanPosts(parsed)));
    }
  } catch {}
}

/**
 * Tracks a post view reliably:
 * 1. Checks local / in-memory deduplication cooldown.
 * 2. Immediately marks as viewed to prevent double counting.
 * 3. Uses navigator.sendBeacon with fetch fallback for guaranteed delivery during fast mobile exits.
 * 4. Also performs client-side Firestore increment as an extra safeguard.
 */
export function trackPostView(postId: string): void {
  if (!postId) return;

  if (hasViewedRecently(postId)) {
    return;
  }

  // Immediately lock in memory/storage
  recordView(postId);

  const payload = JSON.stringify({ postId });

  // 1. Fire edge serverless route via sendBeacon (immune to page unloads / in-app webview closures)
  let beaconSent = false;
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      beaconSent = navigator.sendBeacon('/api/posts/track-view', blob);
    } catch {
      beaconSent = false;
    }
  }

  // 2. Fallback to fetch with keepalive if beacon was not sent or not supported
  if (!beaconSent && typeof fetch !== 'undefined') {
    try {
      fetch('/api/posts/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  // 3. Client Firestore direct update as redundancy (runs unblocked in parallel)
  try {
    if (db) {
      const postRef = doc(db, 'posts', postId);
      updateDoc(postRef, { viewsCount: increment(1) }).catch(() => {});
    }
  } catch {}
}
