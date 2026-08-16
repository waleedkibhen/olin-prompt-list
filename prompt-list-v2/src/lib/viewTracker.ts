const VIEWS_STORAGE_KEY = 'olin_viewed_posts';
const COOLDOWN_HOURS = 24;

interface ViewedPosts {
  [postId: string]: number; // timestamp in milliseconds
}

export function hasViewedRecently(postId: string): boolean {
  try {
    const stored = localStorage.getItem(VIEWS_STORAGE_KEY);
    if (!stored) return false;

    const viewedPosts: ViewedPosts = JSON.parse(stored);
    const lastViewed = viewedPosts[postId];

    if (!lastViewed) return false;

    const now = Date.now();
    const hoursSinceView = (now - lastViewed) / (1000 * 60 * 60);

    return hoursSinceView < COOLDOWN_HOURS;
  } catch (error) {
    console.error('Error reading view history:', error);
    return false;
  }
}

export function recordView(postId: string): void {
  try {
    const stored = localStorage.getItem(VIEWS_STORAGE_KEY);
    const viewedPosts: ViewedPosts = stored ? JSON.parse(stored) : {};

    // Clean up old entries to prevent localStorage from growing infinitely
    const now = Date.now();
    const cleanedPosts: ViewedPosts = {};
    for (const [id, timestamp] of Object.entries(viewedPosts)) {
      if ((now - timestamp) / (1000 * 60 * 60) < COOLDOWN_HOURS) {
        cleanedPosts[id] = timestamp;
      }
    }

    cleanedPosts[postId] = now;
    localStorage.setItem(VIEWS_STORAGE_KEY, JSON.stringify(cleanedPosts));
  } catch (error) {
    console.error('Error recording view history:', error);
  }
}
