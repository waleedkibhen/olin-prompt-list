import React, { useState, useEffect } from 'react';
import styles from './DiscoveryFeed.module.css';
import { PromptPost } from '@/lib/mockData';
import { getPersonalizedCategories, recordSearchTerm } from '@/lib/personalization';
import PromptCard from './PromptCard';
import { Compass, Flame, Clock, Layers, Loader2, Search, AlertTriangle, X } from 'lucide-react';
import { calculateCosineSimilarity } from '@/lib/vector';
import { generateLiveEmbedding } from '@/lib/ai';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'react-router-dom';

export default function DiscoveryFeed() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<'for_you' | 'trending' | 'newest'>('for_you');
  
  const [dbPosts, setDbPosts] = useState<PromptPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<PromptPost[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [modelFilter, setModelFilter] = useState('All Models');
  const [isSearching, setIsSearching] = useState(false);
  
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
    const queryParam = searchParams.get('search') || '';
    const modelParam = searchParams.get('model') || 'All Models';
    setSearchFilter(queryParam);
    setModelFilter(modelParam);
    if (queryParam.trim().length >= 2) {
      recordSearchTerm(queryParam);
    }
    if (dbPosts.length > 0) {
      applyFiltersAndSearch(dbPosts, selectedCategory, activeTab, queryParam, modelParam);
    }
  }, [searchParams, selectedCategory, activeTab]);

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPermissionError(false);
      const liveItems: PromptPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isFlagged === true) return;
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
          embedding: data.embedding
        });
      });

      setDbPosts(liveItems);
      setIsLoadingDb(false);
      
      const queryParam = searchParams.get('search') || '';
      const modelParam = searchParams.get('model') || 'All Models';
      applyFiltersAndSearch(liveItems, selectedCategory, activeTab, queryParam, modelParam);
    }, (error: any) => {
      console.error("Firestore error:", error);
      setIsLoadingDb(false);
      if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
        setPermissionError(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const applyFiltersAndSearch = async (
    items: PromptPost[],
    category: string,
    tab: 'for_you' | 'trending' | 'newest',
    search: string,
    model: string
  ) => {
    let current = [...items];

    if (model && model !== 'All Models') {
      current = current.filter(p => p.model === model);
    }

    const activeCategoryQuery = (category !== 'All' && category !== 'All Styles') ? category.trim() : '';
    const activeSearchQuery = search.trim();
    const combinedQuery = [activeCategoryQuery, activeSearchQuery].filter(Boolean).join(' ');

    if (combinedQuery) {
      setIsSearching(true);
      const cleanSearch = combinedQuery.toLowerCase();
      const queryTokens = cleanSearch.split(/\s+/).filter(Boolean);

      try {
        const queryVec = await generateLiveEmbedding(cleanSearch);
        const evaluated = await Promise.all(
          current.map(async (post) => {
            const contentString = `${post.title} ${post.description} ${post.promptText} ${post.styleTag} ${post.categories.join(" ")}`.toLowerCase();
            const hasKeywordMatch = queryTokens.some(token => contentString.includes(token));
            
            let similarity = 0;
            if (post.embedding && post.embedding.length === 768) {
              similarity = calculateCosineSimilarity(queryVec, post.embedding);
            } else {
              const postVec = await generateLiveEmbedding(contentString);
              similarity = calculateCosineSimilarity(queryVec, postVec);
            }

            return { post, similarity, hasKeywordMatch };
          })
        );

        const STRICT_SEMANTIC_THRESHOLD = 0.22;
        const strictMatches = evaluated.filter(item => item.hasKeywordMatch || item.similarity >= STRICT_SEMANTIC_THRESHOLD);

        strictMatches.sort((a, b) => {
          if (a.hasKeywordMatch && !b.hasKeywordMatch) return -1;
          if (!a.hasKeywordMatch && b.hasKeywordMatch) return 1;
          return b.similarity - a.similarity;
        });

        current = strictMatches.map(item => item.post);
      } catch (err) {
        current = current.filter(post => {
          const text = `${post.title} ${post.description} ${post.promptText} ${post.styleTag} ${post.categories.join(" ")}`.toLowerCase();
          return queryTokens.some(token => text.includes(token));
        });
      } finally {
        setIsSearching(false);
      }
    }

    if (tab === 'trending') {
      current.sort((a, b) => (b.likesCount + b.savesCount) - (a.likesCount + a.savesCount));
    } else if (tab === 'for_you') {
      const userFavoriteStyles = items
        .filter(p => likedPosts.includes(p.id) || savedPosts.includes(p.id))
        .map(p => p.styleTag);

      if (userFavoriteStyles.length > 0) {
        current.sort((a, b) => {
          const aMatch = userFavoriteStyles.includes(a.styleTag) ? 1 : 0;
          const bMatch = userFavoriteStyles.includes(b.styleTag) ? 1 : 0;
          return bMatch - aMatch;
        });
      }
    }

    setDisplayedPosts(current);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    applyFiltersAndSearch(dbPosts, category, activeTab, searchFilter, modelFilter);
  };

  const handleTabChange = (tab: 'for_you' | 'trending' | 'newest') => {
    setActiveTab(tab);
    applyFiltersAndSearch(dbPosts, selectedCategory, tab, searchFilter, modelFilter);
  };

  const handleLike = (id: string) => {
    setLikedPosts(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSave = (id: string) => {
    setSavedPosts(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const clearSearch = () => {
    setSearchFilter('');
    setSearchParams({});
    applyFiltersAndSearch(dbPosts, selectedCategory, activeTab, '', modelFilter);
  };

  const dynamicCategories = getPersonalizedCategories(dbPosts, 6);

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
            <span>Search results for <strong>"{searchFilter}"</strong> ({displayedPosts.length})</span>
          </div>
          <button onClick={clearSearch} className={styles.clearSearchBtn} title="Clear Search">
            <X size={15} />
          </button>
        </div>
      )}

      <nav className={styles.categoryNav}>
        <div className={styles.categoryRoller}>
          {dynamicCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                className={`${styles.categoryTab} ${isActive ? styles.categoryTabActive : ''}`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </nav>

      <div className={styles.feedSortRow}>
        <div className={styles.sortTabs}>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'for_you' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('for_you')}
          >
            <Compass size={15} />
            <span>For You</span>
          </button>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'trending' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('trending')}
          >
            <Flame size={15} />
            <span>Trending</span>
          </button>
          <button 
            className={`${styles.sortBtn} ${activeTab === 'newest' ? styles.sortActive : ''}`}
            onClick={() => handleTabChange('newest')}
          >
            <Clock size={15} />
            <span>Newest</span>
          </button>
        </div>

        <span className={styles.itemCount}>{displayedPosts.length} Pins</span>
      </div>

      {isLoadingDb || isSearching ? (
        <div className={styles.emptyState}>
          <Loader2 size={32} className={styles.spinner} />
          <span>{isSearching ? 'Searching artwork...' : 'Loading visuals...'}</span>
        </div>
      ) : displayedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <Layers size={36} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
          <h3>{searchFilter ? `No visual matches found for "${searchFilter}"` : 'No artwork uploaded yet'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
            {searchFilter ? 'Try searching another keyword or clearing filters.' : 'Be the first creator to upload visual AI artwork using the Share button.'}
          </p>
          {searchFilter && (
            <button className="btn-outline" onClick={() => { setSelectedCategory('All'); clearSearch(); }} style={{ marginTop: '0.5rem' }}>
              Reset Filters
            </button>
          )}
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
