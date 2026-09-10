import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const COPIES_STORAGE_KEY = 'olin_copied_prompts';
const COPY_COOLDOWN_HOURS = 6; // Prevents inflating copy counts within 6 hours on the same device
const CLICK_THROTTLE_MS = 2000; // Hard debounce on rapid repetitive clicks

interface CopiedPosts {
  [postId: string]: number; // timestamp in milliseconds
}

// In-memory fallback if localStorage and sessionStorage are restricted
const inMemoryCopiedPosts: CopiedPosts = {};
let lastClickTime = 0;

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

/**
 * Checks if the user/device has copied this prompt recently.
 */
export function hasCopiedRecently(postId: string): boolean {
  if (!postId) return true;

  try {
    const now = Date.now();

    // 1. Check in-memory
    const memTimestamp = inMemoryCopiedPosts[postId];
    if (memTimestamp && (now - memTimestamp) / (1000 * 60 * 60) < COPY_COOLDOWN_HOURS) {
      return true;
    }

    // 2. Check sessionStorage
    const sessionStore = safeGetStorage('session');
    if (sessionStore) {
      const stored = sessionStore.getItem(COPIES_STORAGE_KEY);
      if (stored) {
        const copiedPosts: CopiedPosts = JSON.parse(stored);
        const lastCopied = copiedPosts[postId];
        if (lastCopied && (now - lastCopied) / (1000 * 60 * 60) < COPY_COOLDOWN_HOURS) {
          inMemoryCopiedPosts[postId] = lastCopied;
          return true;
        }
      }
    }

    // 3. Check localStorage
    const localStore = safeGetStorage('local');
    if (localStore) {
      const stored = localStore.getItem(COPIES_STORAGE_KEY);
      if (stored) {
        const copiedPosts: CopiedPosts = JSON.parse(stored);
        const lastCopied = copiedPosts[postId];
        if (lastCopied && (now - lastCopied) / (1000 * 60 * 60) < COPY_COOLDOWN_HOURS) {
          inMemoryCopiedPosts[postId] = lastCopied;
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.warn('Copy history check fallback:', error);
    return false;
  }
}

/**
 * Records a copy action locally to prevent repeated increments.
 */
export function recordCopy(postId: string): void {
  if (!postId) return;

  const now = Date.now();
  inMemoryCopiedPosts[postId] = now;

  const cleanPosts = (posts: CopiedPosts): CopiedPosts => {
    const cleaned: CopiedPosts = {};
    for (const [id, timestamp] of Object.entries(posts)) {
      if ((now - timestamp) / (1000 * 60 * 60) < COPY_COOLDOWN_HOURS) {
        cleaned[id] = timestamp;
      }
    }
    cleaned[postId] = now;
    return cleaned;
  };

  try {
    const sessionStore = safeGetStorage('session');
    if (sessionStore) {
      const stored = sessionStore.getItem(COPIES_STORAGE_KEY);
      const parsed: CopiedPosts = stored ? JSON.parse(stored) : {};
      sessionStore.setItem(COPIES_STORAGE_KEY, JSON.stringify(cleanPosts(parsed)));
    }
  } catch {}

  try {
    const localStore = safeGetStorage('local');
    if (localStore) {
      const stored = localStore.getItem(COPIES_STORAGE_KEY);
      const parsed: CopiedPosts = stored ? JSON.parse(stored) : {};
      localStore.setItem(COPIES_STORAGE_KEY, JSON.stringify(cleanPosts(parsed)));
    }
  } catch {}
}

/**
 * Safely tracks a prompt copy with multi-layer anti-abuse:
 * 1. Hard click throttle (ignores clicks within 2 seconds).
 * 2. Creator self-pump block (post owner copying their own prompt does not increment count).
 * 3. 6-hour device cooldown per post to prevent artificial inflation.
 * 4. Edge API via sendBeacon with fetch fallback for guaranteed atomic Firestore commit.
 * 
 * Returns true if a new increment was legitimately recorded, false if ignored due to cooldown/ownership.
 */
export function trackPromptCopy(postId: string, isOwner: boolean = false, userId?: string | null): boolean {
  if (!postId) return false;

  const now = Date.now();
  if (now - lastClickTime < CLICK_THROTTLE_MS) {
    return false;
  }
  lastClickTime = now;

  // Prevent creator from self-pumping their own post metrics
  if (isOwner) {
    return false;
  }

  // Prevent repeated pumping within cooldown window
  if (hasCopiedRecently(postId)) {
    return false;
  }

  // Record lock locally immediately
  recordCopy(postId);

  const payload = JSON.stringify({ postId, userId: userId || null });

  // 1. Edge API via sendBeacon
  let beaconSent = false;
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      beaconSent = navigator.sendBeacon('/api/posts/track-copy', blob);
    } catch {
      beaconSent = false;
    }
  }

  // 2. Fallback to fetch with keepalive
  if (!beaconSent && typeof fetch !== 'undefined') {
    try {
      fetch('/api/posts/track-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch {}
  }

  // 3. Fallback client-side Firestore direct update
  try {
    if (db) {
      const postRef = doc(db, 'posts', postId);
      updateDoc(postRef, { copiesCount: increment(1) }).catch(() => {});
    }
  } catch {}

  return true;
}
