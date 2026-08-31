import React, { useState, useEffect, useRef } from 'react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import styles from './Navbar.module.css';
import { Search, Filter, Plus, User, ChevronRight, Check, Moon, Sun, X, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import NotificationBell from './NotificationBell';
import FeedbackModal from './FeedbackModal';
import TopAnnouncementBanner from './TopAnnouncementBanner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { COLOR_OPTIONS, ASPECT_OPTIONS, TIME_OPTIONS } from '../lib/filters';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentSearches, removeRecentSearch } = useRecentSearches();

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        const fullHeight = headerRef.current.offsetHeight;
        const bannerH = isBannerVisible ? Math.max(0, fullHeight - 64) : 0;
        document.documentElement.style.setProperty('--banner-height', `${bannerH}px`);
        document.documentElement.style.setProperty('--header-total-height', `${fullHeight}px`);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [isBannerVisible]);

  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);
  
  // Profile / Notification state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  
  const activeColor = searchParams.get('color') || 'All';
  const activeAspect = searchParams.get('aspect') || 'All Dimensions';
  const activeTime = searchParams.get('time') || 'All Time';

  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 64) {
        setIsHidden(true);
        setShowProfileMenu(false);
        setIsFilterOpen(false);
      } else {
        setIsHidden(false);
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams(prev => {
        prev.set('search', searchQuery.trim());
        return prev;
      });
      setIsSearchExpanded(false);
    } else {
      setSearchParams(prev => {
        prev.delete('search');
        return prev;
      });
      setIsSearchExpanded(false);
    }
    setIsMobileSearchOpen(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value === 'All' || value === 'All Dimensions' || value === 'All Time') {
        prev.delete(key);
      } else {
        prev.set(key, value);
      }
      return prev;
    });
  };



  return (
    <>
      <header ref={headerRef} className={`${styles.headerWrapper} ${isHidden ? styles.navHidden : ''}`} id="top-nav">
        <TopAnnouncementBanner onVisibilityChange={setIsBannerVisible} />
        <nav className={styles.navbarContainer}>
        
        {/* Left side: Logo & Tabs */}
        <div className={styles.leftSection}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Link to="/" className={styles.brandTitle}>
              <img src="/logo.svg" alt="Olin Logo" className={styles.brandImage} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <span>Olin's</span>
                <span className={styles.brandSuffix}>Prompt List</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className={styles.centerSection}>
          <form onSubmit={handleSearchSubmit} className={`${styles.searchFormExpanded} ${(isSearchExpanded && recentSearches.length > 0) ? styles.searchFormActive : ''}`}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search prompts, tags, or styles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              className={styles.searchInput}
              maxLength={100}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className={styles.clearBtn}>
                &times;
              </button>
            )}
          </form>
          
          {isSearchExpanded && recentSearches.length > 0 && (
            <div className={styles.recentSearchesDropdown}>
              <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>Recent searches</h5>
              <div className={styles.recentSearchesGrid}>
                {recentSearches.map(item => (
                  <button 
                    key={item.term} 
                    className={styles.recentSearchPill}
                    onClick={() => {
                      setSearchQuery(item.term);
                      setSearchParams(prev => { prev.set('search', item.term); return prev; });
                      setIsSearchExpanded(false);
                      setIsMobileSearchOpen(false);
                    }}
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.term} className={styles.recentSearchImage} />
                    ) : (
                      <div className={styles.recentSearchImage} style={{ backgroundColor: 'transparent' }} />
                    )}
                    <span>{item.term}</span>
                    <div 
                      className={styles.removeSearchBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(item.term);
                      }}
                    >
                      <X size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Overlay */}
        {isMobileSearchOpen && (
          <div className={styles.mobileSearchOverlay}>
            <div className={styles.mobileSearchHeader}>
              <button className={styles.iconBtn} onClick={() => setIsMobileSearchOpen(false)}>
                <ChevronLeft size={24} />
              </button>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex' }}>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.mobileSearchInput}
                  autoFocus
                  maxLength={100}
                />
              </form>
            </div>
            {recentSearches.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 500 }}>Recent searches</h5>
                <div className={styles.recentSearchesGrid}>
                  {recentSearches.map(item => (
                    <button 
                      key={item.term} 
                      className={styles.recentSearchPill}
                      onClick={() => {
                        setSearchQuery(item.term);
                        setSearchParams(prev => { prev.set('search', item.term); return prev; });
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.term} className={styles.recentSearchImage} />
                      ) : (
                        <div className={styles.recentSearchImage} style={{ backgroundColor: 'transparent' }} />
                      )}
                      <span>{item.term}</span>
                      <div 
                        className={styles.removeSearchBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(item.term);
                        }}
                      >
                        <X size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right side: Actions */}
        <div className={styles.actionControls}>
          {/* Mobile Search Toggle */}
          <button className={`${styles.iconBtn} ${styles.mobileSearchBtn}`} onClick={() => setIsMobileSearchOpen(true)} title="Search">
            <Search size={22} strokeWidth={2} />
          </button>

          {/* Theme Toggle */}
          <button className={styles.iconBtn} onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle Theme">
            {isDarkMode ? <Sun size={22} strokeWidth={2} /> : <Moon size={22} strokeWidth={2} />}
          </button>
            
            {/* Filter Icon & Dropdown */}
            <div style={{ position: 'relative' }} ref={filterRef}>
              <button className={`${styles.iconBtn} ${isFilterOpen ? styles.iconBtnActive : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)} title="Filters">
                <Filter size={22} strokeWidth={2} />
              </button>
              {isFilterOpen && (
                <div className={styles.filterDropdownMenu} onMouseLeave={() => setActiveFilterCategory(null)}>
                  
                  {/* Dimension / Orientation */}
                  <div 
                    className={styles.filterCategoryItem}
                    onMouseEnter={() => setActiveFilterCategory('orientation')}
                  >
                    Size <ChevronRight size={16} />
                    {activeFilterCategory === 'orientation' && (
                      <div className={styles.filterSubMenu}>
                        {ASPECT_OPTIONS.map(a => (
                          <button
                            key={a.value}
                            className={`${styles.filterSubMenuItem} ${activeAspect === a.value ? styles.active : ''}`}
                            onClick={() => handleFilterChange('aspect', a.value)}
                          >
                            {a.label}
                            {activeAspect === a.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Color */}
                  <div 
                    className={styles.filterCategoryItem}
                    onMouseEnter={() => setActiveFilterCategory('color')}
                  >
                    Color <ChevronRight size={16} />
                    {activeFilterCategory === 'color' && (
                      <div className={styles.filterSubMenu}>
                        <button 
                          className={`${styles.filterSubMenuItem} ${activeColor === 'All' ? styles.active : ''}`}
                          onClick={() => handleFilterChange('color', 'All')}
                        >
                          Any color
                          {activeColor === 'All' && <Check size={14} />}
                        </button>
                        <div className={styles.colorSquaresRow}>
                          {COLOR_OPTIONS.map(c => (
                            <button
                              key={c.name}
                              title={c.name}
                              className={`${styles.colorSquare} ${activeColor === c.name ? styles.colorSquareActive : ''}`}
                              style={{ backgroundColor: c.hex }}
                              onClick={() => handleFilterChange('color', c.name)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeframe */}
                  <div 
                    className={styles.filterCategoryItem}
                    onMouseEnter={() => setActiveFilterCategory('time')}
                  >
                    Time <ChevronRight size={16} />
                    {activeFilterCategory === 'time' && (
                      <div className={styles.filterSubMenu}>
                        {TIME_OPTIONS.map(t => (
                          <button
                            key={t.value}
                            className={`${styles.filterSubMenuItem} ${activeTime === t.value ? styles.active : ''}`}
                            onClick={() => handleFilterChange('time', t.value)}
                          >
                            {t.label}
                            {activeTime === t.value && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Create Post */}
            <button className={styles.iconBtn} onClick={() => navigate('/create')} title="Create Artwork">
              <Plus size={20} strokeWidth={2} />
            </button>
            
            {/* Notifications */}
            {user && (
              <NotificationBell />
            )}
            
            {/* Profile Menu */}
            <div style={{ position: 'relative' }} ref={profileRef}>
              <button className={styles.iconBtn} onClick={() => user ? setShowProfileMenu(!showProfileMenu) : setShowAuthModal(true)} title={user ? "Profile" : "Sign In"}>
                {user ? (
                  <img src={profile?.avatarUrl || user.photoURL || ''} alt="Profile" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={22} strokeWidth={2} />
                )}
              </button>
              {showProfileMenu && (
                <div className={styles.dropdownMenu} style={{ right: 0, width: user ? '220px' : '320px', padding: user ? '0.5rem' : '1.5rem' }}>
                  {user ? (
                    <>
                      <div className={styles.profileDropdownHeader}>
                        <img src={profile?.avatarUrl || user.photoURL || ''} alt="Avatar" className={styles.profileAvatar} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.displayName || user.displayName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{profile?.username}</span>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link to={`/creator/${profile?.username}`} className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>My Profile</Link>
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Creator Dashboard</Link>
                      <Link to="/settings" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Settings</Link>
                      <button className={styles.dropdownItem} onClick={() => { setIsFeedbackModalOpen(true); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }}>
                        Submit Feedback
                      </button>
                      {user.email === 'wisecrafts81@gmail.com' && (
                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Superadmin Console</Link>
                      )}
                      <div className={styles.dropdownDivider} />
                      <button className={`${styles.dropdownItem} ${styles.signOutItem}`} onClick={() => { signOut(); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <GoogleSignInButton onSuccess={() => setShowProfileMenu(false)} />
                  )}
                </div>
              )}
            </div>
          </div>
      </nav>
    </header>

      {/* Expanded Search Backdrop */}
      {isSearchExpanded && (
        <div className={styles.searchBackdrop} onClick={() => setIsSearchExpanded(false)} />
      )}

      {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}

      {/* Auth Modal */}
      {!user && showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setShowAuthModal(false)}>
          <div style={{ backgroundColor: '#0d0d10', padding: '2.25rem 1.75rem', borderRadius: '16px', border: '1px solid #27272a', width: '100%', maxWidth: '430px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
            <img src="/logo.svg" alt="Olin Logo" style={{ width: '40px', height: '40px', marginBottom: '1rem', objectFit: 'contain' }} />
            <h2 style={{ margin: '0 0 0.35rem 0', fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: 700, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', width: '100%', letterSpacing: '-0.01em' }}>
              Welcome to Olin's Prompt List
            </h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0.875rem', whiteSpace: 'nowrap', width: '100%' }}>
              Sign in to continue browsing
            </p>
            <GoogleSignInButton onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}

    </>
  );
}
