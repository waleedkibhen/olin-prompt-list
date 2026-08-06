import React, { useState, useEffect } from 'react';
import styles from './DiscoveryFeed.module.css';
import { PromptPost } from '@/lib/mockData';
import { recordSearchTerm } from '@/lib/personalization';
import PromptCard from './PromptCard';
import { useAuth } from '@/context/AuthContext';
import { 
  Compass, Flame, Clock, Layers, Loader2, Search, AlertTriangle, X, 
  SlidersHorizontal, Palette, Sparkles, Image as ImageIcon, Calendar, Lock, RotateCcw, Check 
} from 'lucide-react';
import { calculateCosineSimilarity } from '@/lib/vector';
import { generateLiveEmbedding } from '@/lib/ai';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';
import { matchesColorFilter } from '@/lib/colorAnalyzer';

const COLOR_OPTIONS = [
  { name: 'Red & Crimson', hex: '#ef4444', keywords: ['red', 'crimson', 'blood', 'scarlet', 'fire', 'ruby', 'flames', 'maroon', 'cherry'] },
  { name: 'Orange & Sunset', hex: '#f97316', keywords: ['orange', 'sunset', 'bronze', 'copper', 'rust', 'coral', 'autumn', 'tiger', 'tangerine'] },
  { name: 'Yellow & Gold', hex: '#eab308', keywords: ['yellow', 'gold', 'amber', 'lemon', 'blonde', 'sun', 'golden', 'warm', 'brass', 'honey'] },
  { name: 'Green & Emerald', hex: '#10b981', keywords: ['green', 'emerald', 'forest', 'moss', 'nature', 'jade', 'grass', 'jungle', 'mint', 'foliage'] },
  { name: 'Cyan & Teal', hex: '#06b6d4', keywords: ['cyan', 'teal', 'turquoise', 'aqua', 'marine', 'sea', 'cyan blue'] },
  { name: 'Blue & Azure', hex: '#3b82f6', keywords: ['blue', 'azure', 'navy', 'water', 'sky', 'ocean', 'sapphire', 'ice', 'cool', 'cobalt'] },
  { name: 'Purple & Violet', hex: '#a855f7', keywords: ['purple', 'violet', 'indigo', 'lavender', 'neon purple', 'amethyst', 'plum', 'grape'] },
  { name: 'Pink & Rose', hex: '#ec4899', keywords: ['pink', 'rose', 'pastel', 'blush', 'magenta', 'cherry blossom', 'flamingo', 'fuchsia', 'salmon'] },
  { name: 'Brown & Earth', hex: '#8b4513', keywords: ['brown', 'earth', 'wood', 'timber', 'leather', 'coffee', 'chocolate', 'dirt', 'mud', 'sand', 'sepia'] },
  { name: 'Monochrome & Gray', hex: '#94a3b8', keywords: ['gray', 'grey', 'monochrome', 'grayscale', 'silver', 'neutral', 'slate', 'ash', 'charcoal', 'black and white'] },
  { name: 'Dark & Noir', hex: '#1e293b', keywords: ['dark', 'black', 'noir', 'shadow', 'midnight', 'obsidian', 'gloomy', 'goth', 'night'] },
  { name: 'Clean White & Light', hex: '#f8fafc', keywords: ['white', 'light', 'clean', 'minimal', 'ivory', 'snow', 'bright', 'studio background'] },
];

const TYPE_OPTIONS = [
  { label: 'All Types', value: 'All Types' },
  { label: '📸 Photorealism', value: 'Photorealistic', keywords: ['photo', 'realistic', 'portrait', 'canon', 'macro', '8k', 'photorealistic', 'photography', 'lifelike', 'raw photo', 'dslr'] },
  { label: '🧊 3D Render & CGI', value: '3D Render', keywords: ['3d', 'blender', 'unreal engine', 'render', 'cgi', 'octane', 'pixar', 'volumetric', 'cinema4d', 'rendering', '3d model'] },
  { label: '🎨 Digital & Anime', value: 'Illustration', keywords: ['anime', 'manga', 'illustration', 'digital art', 'comic', 'painting', 'watercolor', 'concept art', 'cel-shaded', 'ghibli'] },
  { label: '🚀 Cyberpunk & Sci-Fi', value: 'Sci-Fi', keywords: ['cyberpunk', 'futuristic', 'sci-fi', 'neon', 'mecha', 'space', 'synthwave', 'android', 'cyber', 'robot', 'scifi'] },
  { label: '🪄 Fantasy & Mythical', value: 'Fantasy', keywords: ['fantasy', 'dragon', 'magic', 'wizard', 'elf', 'mystical', 'enchanted', 'spell', 'armor', 'mythical', 'fairy', 'witch'] },
  { label: '📐 Clipart / Line / Logo', value: 'Minimalist', keywords: ['minimal', 'simple', 'clipart', 'line drawing', 'logo', 'vector', 'flat', 'icon', 'background', 'minimalist', 'clean'] }
];

const ASPECT_OPTIONS = [
  { label: 'All Dimensions', value: 'All Dimensions' },
  { label: '⏹️ Square (1:1)', value: 'Square', keywords: ['1:1', 'square', 'avatar', 'instagram'] },
  { label: '📱 Portrait (9:16 / Vertical)', value: 'Portrait', keywords: ['9:16', '3:4', 'portrait', 'vertical', 'wallpaper', 'reels', 'mobile'] },
  { label: '🖥️ Landscape (16:9 / Widescreen)', value: 'Landscape', keywords: ['16:9', '4:3', '21:9', 'landscape', 'horizontal', 'widescreen', 'cinematic', 'header', 'desktop'] }
];

const TIME_OPTIONS = [
  { label: 'All Time', value: 'All Time' },
  { label: '⚡ Past 24 Hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: '📅 Past 7 Days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '🗓️ Past 30 Days', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 }
];

const VAULT_OPTIONS = [
  { label: 'All Artwork', value: 'All Artwork' },
  { label: '🎁 Free Open Prompts', value: 'free' },
  { label: '💎 PRO Exclusive Vaults', value: 'subscribers_only' }
];

export default function DiscoveryFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending' | 'newest'>('for_you');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Multi-dimensional filter states
  const [colorFilter, setColorFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [aspectFilter, setAspectFilter] = useState('All Dimensions');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [vaultFilter, setVaultFilter] = useState('All Artwork');
  
  const { profile } = useAuth();
  
  const [dbPosts, setDbPosts] = useState<PromptPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PromptPost[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('All Models');
  const [isSearching, setIsSearching] = useState(false);

  const activeFilterCount = [
    colorFilter !== 'All',
    typeFilter !== 'All Types',
    aspectFilter !== 'All Dimensions',
    timeFilter !== 'All Time',
    vaultFilter !== 'All Artwork',
    modelFilter !== 'All Models'
  ].filter(Boolean).length;

  useEffect(() => {
    const queryParam = searchParams.get('search') || '';
    const modelParam = searchParams.get('model') || 'All Models';
    setSearchFilter(queryParam);
    setModelFilter(modelParam);
    if (queryParam.trim().length >= 2) {
      recordSearchTerm(queryParam);
    }
    if (dbPosts.length > 0) {
      applyAllFiltersAndSearch(dbPosts, activeTab, queryParam, modelParam, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter);
    }
  }, [searchParams, activeTab, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter]);

  useEffect(() => {
    // Limit to newest 200 posts to create the local candidate pool (prevents catastrophic db read costs)
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(200));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPermissionError(false);
      const liveItems: PromptPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        // AI moderation flags remove the post instantly; User reports keep the post public while queuing for Admin review
        if (data.isFlagged === true && data.flagSource !== 'user' && !String(data.flaggedReason || '').startsWith('Reported by')) return;
        liveItems.push({
          id: docSnap.id,
          title: data.title || 'Untitled Creation',
          description: data.description || '',
          promptText: data.promptText || '',
          negativePrompt: data.negativePrompt || null,
          imageUrls: data.imageUrls || [],
          model: data.model || 'Midjourney V6',
          styleTag: data.styleTag || 'Community',
          categories: data.categories || [],
          creator: {
            uid: data.creatorId || 'anonymous',
            displayName: data.creatorDisplayName || 'AI Creator',
            username: data.creatorUsername || 'creator',
            avatarUrl: data.creatorAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: 0
          },
          likesCount: data.likesCount || 0,
          savesCount: data.savesCount || 0,
          viewsCount: data.viewsCount || 1,
          copiesCount: data.copiesCount || 0,
          isPaid: data.isPaid || false,
          price: data.price || 0,
          monetizationType: data.monetizationType || (data.isPaid ? 'subscribers_only' : 'free'),
          isFlagged: data.isFlagged || false,
          flaggedReason: data.flaggedReason || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Just now',
          rawTimestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
          aspectRatio: data.aspectRatio || 'Square',
          embedding: data.embedding,
          colorProfile: data.colorProfile || null
        });
      });

      setDbPosts(liveItems);
      setIsLoadingDb(false);
      
      const queryParam = searchParams.get('search') || '';
      const modelParam = searchParams.get('model') || 'All Models';
      applyAllFiltersAndSearch(liveItems, activeTab, queryParam, modelParam, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter, true);
    }, (error: any) => {
      console.error("Firestore error:", error);
      setIsLoadingDb(false);
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        setPermissionError(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const applyAllFiltersAndSearch = async (
    items: PromptPost[],
    tab: 'for_you' | 'trending' | 'newest',
    search: string,
    model: string,
    color: string,
    type: string,
    aspect: string,
    time: string,
    vault: string,
    isBackgroundUpdate = false
  ) => {
    let current = [...items];

    // 1. Model Engine Filter
    if (model && model !== 'All Models') {
      current = current.filter(p => p.model === model || p.model.toLowerCase().includes(model.toLowerCase()));
    }

    // 2. Color Palette Filter & Percentage Concentration Ranking
    if (color && color !== 'All' && color !== 'Any Color') {
      const selectedColObj = COLOR_OPTIONS.find(c => c.name === color);
      const keywords = selectedColObj ? selectedColObj.keywords : [];
      current = current.filter(post => {
        const contentStr = `${post.title} ${post.description} ${post.promptText} ${post.styleTag} ${post.categories.join(" ")}`;
        return matchesColorFilter(color, post.colorProfile, contentStr, keywords);
      });

      // Rank results strictly by percentage concentration of the selected color! (100% color -> 50% color -> 15% color)
      current.sort((a, b) => {
        const getPercentage = (p?: any): number => {
          if (!p) return 0;
          if (p.colorPercentages && p.colorPercentages[color] !== undefined) {
            return p.colorPercentages[color];
          }
          // Backward compatibility mappings for pre-existing catalog scans
          if (color === 'Blue & Azure' && p.colorPercentages?.['Blue & Cyan']) return p.colorPercentages['Blue & Cyan'];
          if (color === 'Cyan & Teal' && p.colorPercentages?.['Blue & Cyan']) return p.colorPercentages['Blue & Cyan'];
          if (color === 'Monochrome & Gray' && p.colorPercentages?.['Monochrome & Grayscale']) return p.colorPercentages['Monochrome & Grayscale'];

          // Fallback percentage estimations based on primary vs secondary dominance rank
          if (p.colorNames && p.colorNames.length > 0) {
            const idx = p.colorNames.indexOf(color);
            if (idx === 0) return 65; // Primary dominant color
            if (idx === 1) return 35; // Secondary color
            if (idx >= 2) return 18;  // Tertiary color
          }
          if (color === 'Dark & Noir' && p.isDark) return 50;
          if (color === 'Clean White & Light' && p.isLight) return 50;
          if (color === 'Monochrome & Gray' && p.isMonochrome) return 50;
          return 0;
        };
        return getPercentage(b.colorProfile) - getPercentage(a.colorProfile);
      });
    }

    // 3. Art Type & Medium Filter
    if (type && type !== 'All Types') {
      const selectedTypeObj = TYPE_OPTIONS.find(t => t.value === type);
      if (selectedTypeObj && selectedTypeObj.keywords) {
        current = current.filter(post => {
          if (post.styleTag === selectedTypeObj.value || post.styleTag.toLowerCase().includes(type.toLowerCase())) return true;
          const contentStr = `${post.title} ${post.description} ${post.promptText} ${post.styleTag} ${post.categories.join(" ")}`.toLowerCase();
          return selectedTypeObj.keywords.some(kw => contentStr.includes(kw));
        });
      }
    }

    // 4. Aspect Ratio / Dimensions Filter
    if (aspect && aspect !== 'All Dimensions') {
      const selectedAspectObj = ASPECT_OPTIONS.find(a => a.value === aspect);
      if (selectedAspectObj) {
        current = current.filter(post => {
          if (post.aspectRatio && post.aspectRatio.toLowerCase().includes(selectedAspectObj.value.toLowerCase())) return true;
          const contentStr = `${post.title} ${post.description} ${post.promptText} ${post.categories.join(" ")}`.toLowerCase();
          return selectedAspectObj.keywords?.some(kw => contentStr.includes(kw));
        });
      }
    }

    // 5. Timeframe / Recency Filter
    if (time && time !== 'All Time') {
      const timeObj = TIME_OPTIONS.find(t => t.value === time);
      if (timeObj && timeObj.ms) {
        const now = Date.now();
        current = current.filter(post => {
          const postTime = post.rawTimestamp || now;
          return (now - postTime) <= timeObj.ms!;
        });
      }
    }

    // 6. Vault Access / Monetization Filter
    if (vault && vault !== 'All Artwork') {
      if (vault === 'free') {
        current = current.filter(p => !p.isPaid && p.monetizationType !== 'subscribers_only');
      } else if (vault === 'subscribers_only') {
        current = current.filter(p => p.isPaid || p.monetizationType === 'subscribers_only');
      }
    }

    // 7. High-Precision Visual Color & Keyword Search
    const activeSearchQuery = search.trim();
    if (activeSearchQuery) {
      if (!isBackgroundUpdate) setIsSearching(true);
      const cleanSearch = activeSearchQuery.toLowerCase();
      const queryTokens = cleanSearch.split(/\s+/).filter(Boolean);

      // Identify if the search query corresponds to one of our universal color palettes
      const matchedColorOption = COLOR_OPTIONS.find(c => 
        c.name.toLowerCase().includes(cleanSearch) || 
        c.keywords.some(kw => kw.toLowerCase() === cleanSearch || cleanSearch.includes(kw.toLowerCase()))
      );

      const isColorSearch = Boolean(matchedColorOption) && queryTokens.length <= 2;
      const targetColorName = matchedColorOption?.name;

      // Strict regex word-boundary matcher (prevents words like "layered" or "tattered" from matching "red")
      const matchWord = (text: string, kw: string): boolean => {
        if (!kw || !text) return false;
        try {
          const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return regex.test(text);
        } catch {
          return text.toLowerCase().includes(kw.toLowerCase());
        }
      };

      current = current
        .map(post => {
          let score = 0;
          const contentStr = `${post.title} ${post.description} ${post.promptText} ${post.styleTag} ${post.categories.join(" ")}`.toLowerCase();
          const hasKeywordMatch = queryTokens.some(token => matchWord(contentStr, token));
          const hasExactMatch = matchWord(contentStr, cleanSearch);

          if (isColorSearch && targetColorName) {
            // PINTEREST-LEVEL QUALITY RULE: Visual color dominance in the artwork is MANDATORY!
            // Trace colors (<45%) or text mentions without visual dominance (like "red flag" on a blue tower) MUST NOT pollute results.
            const profile = post.colorProfile;
            if (profile?.colorNames && profile.colorNames.length > 0) {
              const primaryColor = profile.colorNames[0];
              let idx = profile.colorNames.indexOf(targetColorName);
              let perc = profile.colorPercentages?.[targetColorName];
              if (targetColorName === 'Blue & Azure' && idx === -1) {
                idx = profile.colorNames.indexOf('Blue & Cyan');
                if (idx !== -1) perc = profile.colorPercentages?.['Blue & Cyan'];
              }
              if (targetColorName === 'Cyan & Teal' && idx === -1) {
                idx = profile.colorNames.indexOf('Blue & Cyan');
                if (idx !== -1) perc = profile.colorPercentages?.['Blue & Cyan'];
              }
              if (targetColorName === 'Monochrome & Gray' && idx === -1) {
                idx = profile.colorNames.indexOf('Monochrome & Grayscale');
                if (idx !== -1) perc = profile.colorPercentages?.['Monochrome & Grayscale'];
              }

              // Contrast Rejection Rule: Stop glowing red towers from appearing in blue search, and vice versa!
              const isWarmPrimary = ['Red & Crimson', 'Orange & Sunset', 'Pink & Rose', 'Yellow & Gold', 'Orange & Amber'].includes(primaryColor);
              const isCoolTarget = ['Blue & Azure', 'Cyan & Teal', 'Blue & Cyan'].includes(targetColorName);
              const isCoolPrimary = ['Blue & Azure', 'Cyan & Teal', 'Blue & Cyan', 'Green & Emerald'].includes(primaryColor);
              const isWarmTarget = ['Red & Crimson', 'Orange & Sunset', 'Pink & Rose', 'Yellow & Gold', 'Orange & Amber'].includes(targetColorName);

              const isContrasting = (isCoolTarget && isWarmPrimary) || (isWarmTarget && isCoolPrimary);
              const isPrimary = idx === 0;
              const isStrongSecondary = idx === 1 && (perc !== undefined && perc >= 45);

              if (!isContrasting && (isPrimary || isStrongSecondary)) {
                // Score strictly by visual concentration! (100% solid red -> 10,100 #1 rank)
                score = 10000 + (perc !== undefined ? perc : (isPrimary ? 80 : 45));
              } else {
                // Reject images where color is merely a trace accent, contrasting, or completely missing
                score = 0;
              }
            } else if (!profile) {
              // Fallback ONLY for legacy posts that haven't been scanned by AI yet (uses strict whole-word match)
              if (hasExactMatch || hasKeywordMatch) score = 10;
            }
          } else {
            // Strict Keyword & Tag Search with whole-word boundaries
            if (hasExactMatch) score += 100;
            queryTokens.forEach(token => {
              if (matchWord(contentStr, token)) score += 20;
            });
            if (post.styleTag && matchWord(cleanSearch, post.styleTag)) score += 50;
          }

          return { post, score };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.post);

      if (!isBackgroundUpdate) setIsSearching(false);
    }

    // 8. Sorting Logic (CRITICAL: Do NOT override ranking if Color Filter or Search is active!)
    const isRelevanceSorted = (color && color !== 'All' && color !== 'Any Color') || Boolean(activeSearchQuery);

    if (!isRelevanceSorted) {
      if (tab === 'newest') {
        // Strict chronological sort
        current.sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
      } else if (tab === 'trending') {
        // Viral Velocity Rank: Likes * 3 + Saves * 4 + Copies * 2 + Views
        const now = Date.now();
        current = current.filter(p => {
          const ageInDays = (now - (p.rawTimestamp || 0)) / (1000 * 60 * 60 * 24);
          return ageInDays <= 14; // Fallback to 14 days to ensure candidates exist
        }).sort((a, b) => {
          const scoreA = (a.likesCount * 3) + (a.savesCount * 4) + ((a.copiesCount || 0) * 2) + (a.viewsCount);
          const scoreB = (b.likesCount * 3) + (b.savesCount * 4) + ((b.copiesCount || 0) * 2) + (b.viewsCount);
          return scoreB - scoreA;
        });
        
        // If trending pool is totally empty (e.g. brand new db), fallback to newest
        if (current.length === 0) {
          current = [...items].sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
        }
      } else if (tab === 'for_you') {
        const likedArr = profile?.likedPosts || [];
        const savedArr = profile?.savedPosts || [];
        
        if (likedArr.length > 0 || savedArr.length > 0) {
          // 1. Build Preference Vector from user's historical liked/saved posts
          const preferredPosts = items.filter(p => likedArr.includes(p.id) || savedArr.includes(p.id));
          
          const tagFreq: Record<string, number> = {};
          const styleFreq: Record<string, number> = {};
          
          preferredPosts.forEach(p => {
            p.categories.forEach(c => { tagFreq[c] = (tagFreq[c] || 0) + 1; });
            styleFreq[p.styleTag] = (styleFreq[p.styleTag] || 0) + 1;
          });
          
          const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 15).map(x => x[0]);
          const topStyle = Object.entries(styleFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

          // 2. Score Candidate Pool using Preference Affinity
          current.sort((a, b) => {
            let scoreA = 0; let scoreB = 0;
            a.categories.forEach(c => { if (topTags.includes(c)) scoreA += 3; });
            b.categories.forEach(c => { if (topTags.includes(c)) scoreB += 3; });
            if (a.styleTag === topStyle) scoreA += 5;
            if (b.styleTag === topStyle) scoreB += 5;
            // Introduce slight recency bias for tie-breakers
            return (scoreB + (b.rawTimestamp || 0)/1e12) - (scoreA + (a.rawTimestamp || 0)/1e12);
          });
        } else {
          // Cold Start Fallback: Fall back to Trending if they haven't liked anything yet
          current.sort((a, b) => {
            const scoreA = (a.likesCount * 3) + (a.savesCount * 4) + (a.viewsCount);
            const scoreB = (b.likesCount * 3) + (b.savesCount * 4) + (b.viewsCount);
            return scoreB - scoreA;
          });
        }
      }
    }

    setDisplayedPosts(current);
  };

  const resetAllFilters = () => {
    setColorFilter('All');
    setTypeFilter('All Types');
    setAspectFilter('All Dimensions');
    setTimeFilter('All Time');
    setVaultFilter('All Artwork');
    setModelFilter('All Models');
    setSearchFilter('');
    setSearchParams({});
    applyAllFiltersAndSearch(dbPosts, activeTab, '', 'All Models', 'All', 'All Types', 'All Dimensions', 'All Time', 'All Artwork');
  };

  const handleTabChange = (tab: 'for_you' | 'trending' | 'newest') => {
    setActiveTab(tab);
    applyAllFiltersAndSearch(dbPosts, tab, searchFilter, modelFilter, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter);
  };

  const handleLike = (id: string) => {
    // AuthContext automatically syncs changes via Firestore onSnapshot
  };

  const handleSave = (id: string) => {
    // AuthContext automatically syncs changes via Firestore onSnapshot
  };

  const clearSearch = () => {
    setSearchFilter('');
    setSearchParams({});
    applyAllFiltersAndSearch(dbPosts, activeTab, '', modelFilter, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter);
  };

  return (
    <div className={styles.feedWrapper}>
      {permissionError && (
        <div className={styles.alertBar}>
          <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
          <span>Firestore rules block access. Open Firebase Console &rarr; Firestore Database &rarr; Rules &rarr; set <code>allow read, write: if true;</code></span>
        </div>
      )}

      {searchFilter && (
        <div className={styles.searchPill}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={15} style={{ color: 'var(--text-secondary)' }} />
            <span>Search results for <strong>"{searchFilter}"</strong> ({displayedPosts.length} found)</span>
          </div>
          <button onClick={clearSearch} className={styles.clearSearchBtn} title="Clear Search">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Primary Feed Control Bar */}
      <div className={styles.feedSortRow}>
        <div className={styles.sortTabs}>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'for_you' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('for_you')}
          >
            <Compass size={16} />
            <span>For You</span>
          </button>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'trending' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('trending')}
          >
            <Flame size={16} />
            <span>Trending</span>
          </button>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'newest' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('newest')}
          >
            <Clock size={16} />
            <span>Newest</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className={`${styles.filterToggleBtn} ${isFilterOpen || activeFilterCount > 0 ? styles.filterToggleBtnActive : ''}`}
            onClick={() => setIsFilterOpen(prev => !prev)}
            title="Toggle Visual & AI Parameter Filters"
          >
            <SlidersHorizontal size={16} style={{ color: activeFilterCount > 0 ? 'var(--accent-color)' : 'inherit' }} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className={styles.activeFilterBadge}>{activeFilterCount}</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button onClick={resetAllFilters} className={styles.resetAllBtn} title="Clear All Active Filters">
              Reset ({activeFilterCount})
            </button>
          )}

          <span className={styles.itemCount}>{displayedPosts.length} Pins</span>
        </div>
      </div>

      {/* Advanced Visual & Parameter Filter Studio */}
      {(isFilterOpen || activeFilterCount > 0) && (
        <section className={styles.filterStudioContainer}>
          {/* Row 1: Dominant Color Palette */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>
              <Palette size={15} style={{ color: '#ec4899' }} />
              Color Palette
            </span>
            <div className={styles.colorSwatchRow}>
              <button 
                className={`${styles.filterPill} ${colorFilter === 'All' ? styles.filterPillActive : ''}`}
                onClick={() => setColorFilter('All')}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
              >
                Any Color
              </button>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.name}
                  className={`${styles.colorSwatch} ${colorFilter === c.name ? styles.colorSwatchActive : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColorFilter(prev => prev === c.name ? 'All' : c.name)}
                  title={`Filter by dominant color: ${c.name} (sorted by % concentration)`}
                >
                  {colorFilter === c.name && <Check size={14} style={{ color: c.hex === '#f8fafc' || c.hex === '#eab308' || c.hex === '#facc15' || c.hex === '#06b6d4' ? '#000' : '#fff' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Art Type & Medium */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>
              <Sparkles size={15} style={{ color: '#3b82f6' }} />
              Art Medium
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t.value}
                  className={`${styles.filterPill} ${typeFilter === t.value ? styles.filterPillActive : ''}`}
                  onClick={() => setTypeFilter(prev => prev === t.value ? 'All Types' : t.value)}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Aspect Ratio & Dimensions */}
          <div className={styles.filterRow}>
            <span className={styles.filterLabel}>
              <ImageIcon size={15} style={{ color: '#10b981' }} />
              Orientation
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {ASPECT_OPTIONS.map(a => (
                <button
                  key={a.value}
                  className={`${styles.filterPill} ${aspectFilter === a.value ? styles.filterPillActive : ''}`}
                  onClick={() => setAspectFilter(prev => prev === a.value ? 'All Dimensions' : a.value)}
                >
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Recency & Vault Access */}
          <div className={styles.filterRow} style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
            <span className={styles.filterLabel}>
              <Calendar size={15} style={{ color: '#f97316' }} />
              {ENABLE_MONETIZATION ? 'Time & Vault' : 'Timeframe'}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {TIME_OPTIONS.map(time => (
                <button
                  key={time.value}
                  className={`${styles.filterPill} ${timeFilter === time.value ? styles.filterPillActive : ''}`}
                  onClick={() => setTimeFilter(prev => prev === time.value ? 'All Time' : time.value)}
                >
                  <span>{time.label}</span>
                </button>
              ))}
              
              {ENABLE_MONETIZATION && (
                <>
                  <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem' }}>|</span>

                  {VAULT_OPTIONS.map(vault => (
                    <button
                      key={vault.value}
                      className={`${styles.filterPill} ${vaultFilter === vault.value ? styles.filterPillActive : ''}`}
                      onClick={() => setVaultFilter(prev => prev === vault.value ? 'All Artwork' : vault.value)}
                      style={vault.value === 'subscribers_only' ? { borderColor: '#f59e0b' } : {}}
                    >
                      <span>{vault.label}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Feed Content Area */}
      {isLoadingDb || isSearching ? (
        <div className={styles.emptyState}>
          <Loader2 size={32} className={styles.spinner} />
          <span>{isSearching ? 'Scanning visuals and vector space...' : 'Loading AI prompt creations...'}</span>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
          <h3>No visual artwork matched your active filter configuration</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
            We filtered out all items that didn't match your selected color palette, art medium, orientation, or timeframe. Try broadening your filter selection.
          </p>
          <button className="btn-outline" onClick={resetAllFilters} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RotateCcw size={15} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <main className={styles.masonryGrid}>
          {displayedPosts.map((post) => (
            <PromptCard 
              key={post.id} 
              post={post} 
              onLike={handleLike} 
              onSave={handleSave} 
            />
          ))}
        </main>
      )}
    </div>
  );
}
