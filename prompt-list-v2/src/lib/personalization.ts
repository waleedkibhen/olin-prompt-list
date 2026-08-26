import { PromptPost } from './mockData';

const SEARCH_HISTORY_KEY = 'olin_search_history';

/**
 * Records a user search phrase into local storage for personalized category generation.
 */
export function recordSearchTerm(query: string): void {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) return;
  
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    const existing: string[] = raw ? JSON.parse(raw) : [];
    // Keep exact phrase and also extract key two-word combinations if long
    const itemsToAdd = [clean];
    if (clean.split(/\s+/).length > 2) {
      const words = clean.split(/\s+/).filter(w => w.length >= 3 && !["and", "the", "for", "with"].includes(w));
      for (let i = 0; i < words.length - 1; i += 2) {
        itemsToAdd.push(`${words[i]} ${words[i+1]}`);
      }
    }
    
    const updated = Array.from(new Set([...itemsToAdd, ...existing])).slice(0, 15);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to record search term in localStorage:", err);
  }
}

/**
 * Retrieves recorded user search queries.
 */
export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Helper to capitalize category labels cleanly for visual UI rendering
 */
function formatCategoryTitle(text: string): string {
  if (text.toLowerCase() === 'all') return 'All';
  return text
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates a simplified, personalized list of 5-6 dynamic categories starting with 'All'.
 * Combines recent user search phrases with top trending database tags.
 */
export function getPersonalizedCategories(posts: PromptPost[], maxCategories: number = 6): string[] {
  const result: string[] = ['All'];
  const searchHistory = getSearchHistory();
  const addedLower = new Set<string>(['all']);

  // Add up to 3 personalized items from recent search terms
  for (const term of searchHistory) {
    if (result.length < 4 && !addedLower.has(term.toLowerCase())) {
      result.push(formatCategoryTitle(term));
      addedLower.add(term.toLowerCase());
    }
  }

  // Count tag frequencies from loaded database posts (ignoring metadata noise)
  const ignoreTags = new Set([
    "all", "all styles", "verified upload", "midjourney", "midjourney v6", "dall-e", "dall-e 3", 
    "stable diffusion", "sdxl", "flux", "prompt", "image"
  ]);

  const tagCounts = new Map<string, number>();
  for (const post of posts) {
    if (Array.isArray(post.categories)) {
      for (const cat of post.categories) {
        const clean = cat.trim().toLowerCase();
        if (clean.length > 2 && !ignoreTags.has(clean)) {
          tagCounts.set(clean, (tagCounts.get(clean) || 0) + 1);
        }
      }
    }
    // Also include styleTag if present and valid
    if (post.styleTag) {
      const cleanStyle = post.styleTag.trim().toLowerCase();
      if (cleanStyle.length > 2 && !ignoreTags.has(cleanStyle)) {
        tagCounts.set(cleanStyle, (tagCounts.get(cleanStyle) || 0) + 1);
      }
    }
  }

  // Sort database keywords by high frequency
  const sortedDbTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  for (const tag of sortedDbTags) {
    if (result.length < maxCategories && !addedLower.has(tag)) {
      result.push(formatCategoryTitle(tag));
      addedLower.add(tag);
    }
  }

  // Fallback defaults for cold starts if database contains fewer tags
  const fallbackThemes = ["3D Render", "Portrait", "Cinematic", "Dark Fantasy", "Nature"];
  for (const theme of fallbackThemes) {
    if (result.length < maxCategories && !addedLower.has(theme.toLowerCase())) {
      result.push(theme);
      addedLower.add(theme.toLowerCase());
    }
  }

  return result.slice(0, maxCategories);
}
