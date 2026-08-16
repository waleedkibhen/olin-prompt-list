import React, { useState, useEffect, useRef } from 'react';
import styles from './DiscoveryFeed.module.css';
import { PromptPost } from '@/lib/mockData';
import { recordSearchTerm } from '@/lib/personalization';
import PromptCard from './PromptCard';

import { useAuth } from '@/context/AuthContext';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import { 
  Compass, Flame, Clock, Layers, Box, Search, AlertTriangle, X, 
  SlidersHorizontal, Palette, Sparkles, Image as ImageIcon, Calendar, RotateCcw, Check 
} from 'lucide-react';
import { calculateCosineSimilarity } from '@/lib/vector';
import { generateLiveEmbedding } from '@/lib/ai';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams, Link } from 'react-router-dom';
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
  { label: 'Photorealism', value: 'Photorealistic', keywords: ['photo', 'realistic', 'portrait', 'canon', 'macro', '8k', 'photorealistic', 'photography', 'lifelike', 'raw photo', 'dslr'] },
  { label: '3D Render & CGI', value: '3D Render', keywords: ['3d', 'blender', 'unreal engine', 'render', 'cgi', 'octane', 'pixar', 'volumetric', 'cinema4d', 'rendering', '3d model'] },
  { label: 'Digital & Anime', value: 'Illustration', keywords: ['anime', 'manga', 'illustration', 'digital art', 'comic', 'painting', 'watercolor', 'concept art', 'cel-shaded', 'ghibli'] },
  { label: 'Cyberpunk & Sci-Fi', value: 'Sci-Fi', keywords: ['cyberpunk', 'futuristic', 'sci-fi', 'neon', 'mecha', 'space', 'synthwave', 'android', 'cyber', 'robot', 'scifi'] },
  { label: 'Fantasy & Mythical', value: 'Fantasy', keywords: ['fantasy', 'dragon', 'magic', 'wizard', 'elf', 'mystical', 'enchanted', 'spell', 'armor', 'mythical', 'fairy', 'witch'] },
  { label: 'Clipart / Line / Logo', value: 'Minimalist', keywords: ['minimal', 'simple', 'clipart', 'line drawing', 'logo', 'vector', 'flat', 'icon', 'background', 'minimalist', 'clean'] }
];

const ASPECT_OPTIONS = [
  { label: 'All Dimensions', value: 'All Dimensions' },
  { label: 'Square', value: 'Square', keywords: ['1:1', 'square', 'avatar', 'instagram'] },
  { label: 'Portrait', value: 'Portrait', keywords: ['9:16', '3:4', 'portrait', 'vertical', 'wallpaper', 'reels', 'mobile'] },
  { label: 'Landscape', value: 'Landscape', keywords: ['16:9', '4:3', '21:9', 'landscape', 'horizontal', 'widescreen', 'cinematic', 'header', 'desktop'] }
];

const TIME_OPTIONS = [
  { label: 'All Time', value: 'All Time' },
  { label: 'Past 24 Hours', value: '24h', ms: 24 * 60 * 60 * 1000 },
  { label: 'Past 7 Days', value: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: 'Past 30 Days', value: '30d', ms: 30 * 24 * 60 * 60 * 1000 }
];

const VAULT_OPTIONS = [
  { label: 'All Artwork', value: 'All Artwork' },
  { label: 'Free Open Prompts', value: 'free' },
  { label: 'PRO Exclusive Vaults', value: 'subscribers_only' }
];

const PinterestIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.608 0 12.017 0z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function DiscoveryFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  type TabType = 'for_you' | 'trending' | 'newest' | 'following' | 'saved';
  const activeTab = (searchParams.get('tab') as TabType) || 'for_you';

  // Multi-dimensional filter states
  const colorFilter = searchParams.get('color') || 'All';
  const typeFilter = searchParams.get('type') || 'All Types';
  const aspectFilter = searchParams.get('aspect') || 'All Dimensions';
  const timeFilter = searchParams.get('time') || 'All Time';
  const vaultFilter = searchParams.get('vault') || 'All Artwork';
  
  const { user, profile, signInWithGoogle } = useAuth();
  const { addRecentSearch } = useRecentSearches();
  
  const [dbPosts, setDbPosts] = useState<PromptPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PromptPost[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('All Models');
  const [isSearching, setIsSearching] = useState(false);
  
  const [activeVector, setActiveVector] = useState<number[] | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);

  const activeFilterCount = [
    colorFilter !== 'All',
    typeFilter !== 'All Types',
    aspectFilter !== 'All Dimensions',
    timeFilter !== 'All Time',
    vaultFilter !== 'All Artwork',
    modelFilter !== 'All Models'
  ].filter(Boolean).length;

  const filterSignature = `${searchParams.toString()}|${activeTab}|${colorFilter}|${typeFilter}|${aspectFilter}|${timeFilter}|${vaultFilter}|${profile?.uid || 'anon'}|${activeVector ? 'vector' : 'no-vector'}`;
  const lastFilterSignature = useRef<string>('');

  useEffect(() => {
    const queryParam = searchParams.get('search') || '';
    const modelParam = searchParams.get('model') || 'All Models';
    setSearchFilter(queryParam);
    setModelFilter(modelParam);
    if (queryParam.trim().length >= 2) {
      recordSearchTerm(queryParam);
    }
    if (dbPosts.length > 0) {
      const isBackgroundUpdate = lastFilterSignature.current === filterSignature && displayedPosts.length > 0;
      lastFilterSignature.current = filterSignature;

      if (isBackgroundUpdate) {
        // Sync new db data (like counts/saves) strictly in-place to prevent UI jumping while scrolling!
        setDisplayedPosts(prev => prev.map(p => {
          const updated = dbPosts.find(dbP => dbP.id === p.id);
          return updated ? updated : p;
        }));
      } else {
        // Full recalculation and resort for filter/tab/auth changes
        setVisibleCount(24); // Reset visible items on new layout
        applyAllFiltersAndSearch(dbPosts, activeTab, queryParam, modelParam, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter, activeVector);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, activeTab, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter, dbPosts, profile, activeVector]);

  // Infinite Scroll Observer
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 800 >= 
        document.documentElement.offsetHeight
      ) {
        setVisibleCount(prev => Math.min(prev + 24, displayedPosts.length));
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedPosts.length]);

  useEffect(() => {
    const fetchEmbedding = async () => {
      const term = searchParams.get('search')?.trim() || '';
      
      // Skip embedding generation for short terms or known color searches to save API costs
      const isColor = COLOR_OPTIONS.some(c => 
        c.name.toLowerCase().includes(term.toLowerCase()) || 
        c.keywords.some(kw => kw.toLowerCase() === term.toLowerCase() || term.toLowerCase().includes(kw.toLowerCase()))
      );
      
      if (term.length >= 3 && !isColor) {
        try {
          const vec = await generateLiveEmbedding(term);
          setActiveVector(vec);
        } catch (e) {
          console.error('Failed to generate search embedding', e);
          setActiveVector(null);
        }
      } else {
        setActiveVector(null);
      }
    };
    fetchEmbedding();
  }, [searchParams]);

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
          prompts: data.prompts || undefined,
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
          commentCount: data.commentCount || data.commentsCount || 0,
          isPaid: data.isPaid || false,
          price: data.price || 0,
          monetizationType: data.monetizationType || (data.isPaid ? 'subscribers_only' : 'free'),
          isFlagged: data.isFlagged || false,
          flaggedReason: data.flaggedReason || '',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : 'Just now',
          rawTimestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
          aspectRatio: data.aspectRatio || '',
          embedding: data.embedding,
          colorProfile: data.colorProfile || null
        });
      });

      setDbPosts(liveItems);
      setIsLoadingDb(false);
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
    tab: TabType,
    search: string,
    model: string,
    color: string,
    type: string,
    aspect: string,
    time: string,
    vault: string,
    vectorToCompare: number[] | null = null,
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
    /* 
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
    */

    // 4. Aspect Ratio / Dimensions Filter
    if (aspect && aspect !== 'All Dimensions') {
      const selectedAspectObj = ASPECT_OPTIONS.find(a => a.value === aspect);
      if (selectedAspectObj) {
        current = current.filter(post => {
          return post.aspectRatio && post.aspectRatio.toLowerCase().includes(selectedAspectObj.value.toLowerCase());
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
      
      // Synonym Expansion Dictionary (Zero-Cost Semantic Fallback)
      const synonymMap: Record<string, string[]> = {
        'kids': ['children', 'child', 'toddler', 'baby', 'youth'],
        'child': ['children', 'kids', 'kid', 'toddler'],
        'children': ['kids', 'child', 'kid', 'youth'],
        'car': ['cars', 'vehicle', 'automobile'],
        'cars': ['car', 'vehicle', 'automobile'],
        'dog': ['dogs', 'puppy', 'hound', 'canine'],
        'dogs': ['dog', 'puppy', 'hound', 'canine'],
        'cat': ['cats', 'kitten', 'feline'],
        'cats': ['cat', 'kitten', 'feline'],
        'tree': ['trees', 'forest', 'woods'],
        'trees': ['tree', 'forest', 'woods'],
        'city': ['cities', 'urban', 'metropolis', 'town'],
        'house': ['houses', 'home', 'building', 'mansion'],
        'woman': ['women', 'girl', 'female', 'lady'],
        'man': ['men', 'boy', 'male', 'guy'],
      };

      let queryTokens = cleanSearch.split(/\s+/).filter(Boolean);
      
      // Expand query tokens with synonyms
      const expandedTokens = new Set<string>(queryTokens);
      queryTokens.forEach(token => {
        if (synonymMap[token]) {
          synonymMap[token].forEach(syn => expandedTokens.add(syn));
        }
      });
      queryTokens = Array.from(expandedTokens);

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
            
            // Semantic Vector Search: Mathing "kids" to "children"
            if (vectorToCompare && post.embedding && post.embedding.length > 0) {
              const sim = calculateCosineSimilarity(vectorToCompare, post.embedding);
              if (sim > 0.45) { // Lowered threshold to 0.45 (standard for text-embedding-3-small related words)
                // Exponential scaling for highly semantically similar vectors
                score += Math.floor((sim - 0.45) * 400); 
              }
            }
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
        // 48-Hour Viral Window algorithm
        const now = Date.now();
        current = current.sort((a, b) => {
          const ageHoursA = Math.max(0, (now - (a.rawTimestamp || now)) / (1000 * 60 * 60));
          const ageHoursB = Math.max(0, (now - (b.rawTimestamp || now)) / (1000 * 60 * 60));
          
          const baseScoreA = (a.viewsCount * 1) + (a.likesCount * 5) + (a.savesCount * 4) + ((a.commentCount || 0) * 3) + ((a.copiesCount || 0) * 2);
          const baseScoreB = (b.viewsCount * 1) + (b.likesCount * 5) + (b.savesCount * 4) + ((b.commentCount || 0) * 3) + ((b.copiesCount || 0) * 2);
          
          // Posts within 48 hours compete on raw base score. After 48 hours, they are heavily decayed.
          const scoreA = ageHoursA <= 48 ? baseScoreA : (baseScoreA * 0.01) / ageHoursA;
          const scoreB = ageHoursB <= 48 ? baseScoreB : (baseScoreB * 0.01) / ageHoursB;
          
          // Primary sort: highest score
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          
          // Secondary sort: newest first
          return ageHoursA - ageHoursB;
        });
        
        // If trending pool is totally empty (e.g. brand new db), fallback to newest
        if (current.length === 0) {
          current = [...items].sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
        }
      } else if (tab === 'following') {
        const uid = profile?.uid || 'anon';
        const followingArr: string[] = JSON.parse(localStorage.getItem(`following_${uid}`) || '[]');
        current = current.filter(p => followingArr.includes(p.creator.uid)).sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
      } else if (tab === 'saved') {
        const savedArr = profile?.savedPosts || [];
        current = current.filter(p => savedArr.includes(p.id)).sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
      } else if (tab === 'for_you') {
        const likedArr = profile?.likedPosts || [];
        const savedArr = profile?.savedPosts || [];
        
        if (likedArr.length > 0 || savedArr.length > 0) {
          // 1. Build Preference Vector from user's historical liked/saved posts
          const preferredPosts = items.filter(p => likedArr.includes(p.id) || savedArr.includes(p.id));
          
          const tagFreq: Record<string, number> = {};
          const styleFreq: Record<string, number> = {};
          const colorFreq: Record<string, number> = {};
          const modelFreq: Record<string, number> = {};
          
          preferredPosts.forEach(p => {
            const likeIdx = likedArr.indexOf(p.id);
            const saveIdx = savedArr.indexOf(p.id);
            
            let weight = 1;
            if (likeIdx !== -1 && likeIdx >= likedArr.length - 5) weight += 5;
            if (saveIdx !== -1 && saveIdx >= savedArr.length - 5) weight += 8;

            p.categories.forEach(c => { tagFreq[c] = (tagFreq[c] || 0) + weight; });
            styleFreq[p.styleTag] = (styleFreq[p.styleTag] || 0) + weight;
            if (p.model) modelFreq[p.model] = (modelFreq[p.model] || 0) + weight;
            if (p.colorProfile?.colorNames?.[0]) {
              const primaryColor = p.colorProfile.colorNames[0];
              colorFreq[primaryColor] = (colorFreq[primaryColor] || 0) + weight;
            }
          });
          
          // Normalize Global Frequencies (0.0 to 1.0)
          const maxTagFreq = Math.max(...Object.values(tagFreq), 1);
          const maxStyleFreq = Math.max(...Object.values(styleFreq), 1);
          const maxColorFreq = Math.max(...Object.values(colorFreq), 1);
          const maxModelFreq = Math.max(...Object.values(modelFreq), 1);

          // Nearest Neighbor Extraction: Find the 5 most recent explicit likes/saves
          const recentInteractions = [...preferredPosts].sort((a, b) => {
            const aIdx = Math.max(likedArr.indexOf(a.id), savedArr.indexOf(a.id));
            const bIdx = Math.max(likedArr.indexOf(b.id), savedArr.indexOf(b.id));
            return bIdx - aIdx;
          }).slice(0, 5);

          // 2. Score Candidate Pool using Multi-Dimensional Preference Affinity + Nearest Neighbor
          current = current.map(post => {
            let globalScore = 0;
            
            // Proportional Global Affinity
            post.categories.forEach(c => { if (tagFreq[c]) globalScore += (tagFreq[c] / maxTagFreq) * 10; });
            if (post.styleTag && styleFreq[post.styleTag]) globalScore += (styleFreq[post.styleTag] / maxStyleFreq) * 15;
            if (post.model && modelFreq[post.model]) globalScore += (modelFreq[post.model] / maxModelFreq) * 5;
            if (post.colorProfile?.colorNames?.[0]) {
              const pColor = post.colorProfile.colorNames[0];
              if (colorFreq[pColor]) globalScore += (colorFreq[pColor] / maxColorFreq) * 10;
            }

            // Nearest Neighbor Clustering (Massive boost for posts heavily similar to a recent specific like)
            let maxNeighborSim = 0;
            recentInteractions.forEach(recent => {
              let sim = 0;
              const sharedTags = post.categories.filter(c => recent.categories.includes(c)).length;
              sim += (sharedTags * 12); // Shared tags are huge indicators of topic
              if (post.styleTag === recent.styleTag) sim += 20;
              if (post.model === recent.model) sim += 10;
              if (post.colorProfile?.colorNames?.[0] === recent.colorProfile?.colorNames?.[0]) sim += 15;
              
              if (sim > maxNeighborSim) maxNeighborSim = sim;
            });
            
            // Total Affinity Score
            const rawScore = globalScore + maxNeighborSim;
            
            // Gentle Recency Penalty
            const ageInDays = (Date.now() - (post.rawTimestamp || 0)) / (1000 * 60 * 60 * 24);
            const recencyMultiplier = Math.max(0.5, 1 - (ageInDays * 0.02)); 
            
            // Natural Viral Quality Bonus
            const viralBonus = ((post.likesCount || 0) * 0.5) + ((post.savesCount || 0) * 1);
            
            const finalScore = (rawScore * recencyMultiplier) + viralBonus;
            
            return { post, finalScore };
          }).sort((a, b) => b.finalScore - a.finalScore).map(item => item.post);
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
    
    // Save successful recent searches using the actual matching results
    if (search.trim() && current.length > 0) {
      addRecentSearch(search.trim(), current[0].imageUrls[0]);
    }
  };


  const handleLike = (_id: string) => {
    // AuthContext automatically syncs changes via Firestore onSnapshot
  };

  const handleSave = (_id: string) => {
    // AuthContext automatically syncs changes via Firestore onSnapshot
  };

  const clearSearch = () => {
    setSearchFilter('');
    setSearchParams({});
    applyAllFiltersAndSearch(dbPosts, activeTab, '', modelFilter, colorFilter, typeFilter, aspectFilter, timeFilter, vaultFilter);
  };

  const handleTabClick = (tab: string) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
  };


  return (
    <div className={styles.feedWrapper}>
      {permissionError && (
        <div className={styles.alertBar}>
          <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
          <span>Firestore rules block access. Open Firebase Console &rarr; Firestore Database &rarr; Rules &rarr; set <code>allow read, write: if true;</code></span>
        </div>
      )}

      <div className={styles.navTabs}>
        {['for_you', 'trending', 'newest', 'following', 'saved'].map(tab => (
          <button 
            key={tab}
            className={`${styles.navTab} ${activeTab === tab ? styles.navTabActive : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {tab === 'for_you' ? 'For You' : tab === 'trending' ? 'Trending' : tab === 'newest' ? 'Newest' : tab === 'following' ? 'Following' : 'Saved'}
          </button>
        ))}
      </div>

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



      {/* Feed Content Area */}
      {isLoadingDb ? (
        <div className={styles.emptyState}>
          <Box size={40} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
          <span style={{ marginTop: '1rem', fontWeight: 600 }}>Loading feed...</span>
        </div>
      ) : isSearching ? (
        <div className={styles.emptyState}>
          <Box size={40} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
          <span style={{ marginTop: '1rem', fontWeight: 600 }}>Scanning visuals and vector space...</span>
        </div>
      ) : displayedPosts.length === 0 ? (
        activeTab === 'saved' ? (
          !user ? (
            <div className={styles.emptyState}>
              <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>Sign in to view your saved posts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
                You need to authenticate in order to gain access to the saved post or the ability to save posts in the first place.
              </p>
              <button className="btn-solid" onClick={signInWithGoogle} style={{ marginTop: '0.5rem' }}>
                Sign in or sign up
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>You have no saved posts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
                You haven't saved any artwork yet. Browse the feed to find inspiration.
              </p>
              <button className="btn-outline" onClick={() => handleTabClick('for_you')} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={15} />
                <span>Explore</span>
              </button>
            </div>
          )
        ) : activeTab === 'following' ? (
          !user ? (
            <div className={styles.emptyState}>
              <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>Sign in to see posts from creators you follow</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
                You need to authenticate in order to follow creators and see their artwork in this section.
              </p>
              <button className="btn-solid" onClick={signInWithGoogle} style={{ marginTop: '0.5rem' }}>
                Sign in or sign up
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>No posts from followed creators</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
                You either aren't following anyone yet, or the creators you follow haven't posted any artwork.
              </p>
              <button className="btn-outline" onClick={() => handleTabClick('for_you')} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={15} />
                <span>Find creators</span>
              </button>
            </div>
          )
        ) : (
          <div className={styles.emptyState}>
            <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
            <h3>No visual artwork matched your active filter configuration</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px' }}>
              We filtered out all items that didn't match your selected color palette, art medium, orientation, or timeframe. Try broadening your filter selection.
            </p>
            <button className="btn-outline" onClick={() => setSearchParams({})} style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCcw size={15} />
              <span>Reset All Filters</span>
            </button>
          </div>
        )
      ) : (
        <div className="masonry-grid">
          {displayedPosts.slice(0, visibleCount).map(post => (
            <div className="masonry-item" key={post.id}>
              <PromptCard 
                post={post}
                onLike={handleLike}
                onSave={handleSave}
              />
            </div>
          ))}
        </div>
      )}

      {/* Standard Footer */}
      {!isLoadingDb && !isSearching && displayedPosts.length > 0 && (
        <footer className={styles.footer}>
          <div>© 2026 Olin</div>
          <div className={styles.footerLinks}>
            <Link to="/terms" className={styles.footerLink}>Terms</Link>
            <Link to="/privacy" className={styles.footerLink}>Privacy</Link>
          </div>
          <div className={styles.footerIcons}>
            <a href="https://www.instagram.com/olinspromptlist?igsh=aGRsdm4zdTllMmd4" target="_blank" rel="noopener noreferrer" className={styles.footerLink} aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
            <a href="https://pin.it/3a9ohEMV7" target="_blank" rel="noopener noreferrer" className={styles.footerLink} aria-label="Pinterest">
              <PinterestIcon size={18} />
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
