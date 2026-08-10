import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Search, Filter, Plus, User, Bell, ChevronDown, ChevronRight, Check, Sparkles, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRecentSearches } from '@/hooks/useRecentSearches';
import NotificationBell from './NotificationBell';
import FeedbackModal from './FeedbackModal';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { COLOR_OPTIONS, ASPECT_OPTIONS, TIME_OPTIONS } from '../lib/filters';

export default function Navbar() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { recentSearches, removeRecentSearch } = useRecentSearches();
  
  const activeTab = searchParams.get('tab') || 'for_you';
  
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);
  
  // Profile / Notification state
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
  };

  const handleTabClick = (tab: string) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
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
      <nav className={`${styles.navbarContainer} ${isHidden ? styles.navHidden : ''}`} id="top-nav">
        
        {/* Left side: Logo & Tabs */}
        <div className={styles.leftSection}>
          <Link to="/" className={styles.brandTitle}>
            <img src="/logo.png" alt="Olin Logo" className={styles.brandImage} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              <span>Olin</span>
              <span className={styles.brandSuffix}>Prompt List</span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className={styles.centerSection}>
          <form onSubmit={handleSearchSubmit} className={styles.searchFormExpanded}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search prompts, tags, or styles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchExpanded(true)}
              className={styles.searchInput}
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

        {/* Right side: Actions */}
        <div className={styles.actionControls}>
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
              <button className={styles.iconBtn} onClick={() => user ? setShowProfileMenu(!showProfileMenu) : signInWithGoogle()} title={user ? "Profile" : "Sign In"}>
                {user ? (
                  <img src={profile?.avatarUrl || user.photoURL || ''} alt="Profile" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <User size={22} strokeWidth={2} />
                )}
              </button>
              {user && showProfileMenu && (
                <div className={styles.dropdownMenu} style={{ right: 0, width: '220px' }}>
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
                </div>
              )}
            </div>
          </div>
      </nav>

      {/* Expanded Search Backdrop */}
      {isSearchExpanded && (
        <div className={styles.searchBackdrop} onClick={() => setIsSearchExpanded(false)} />
      )}

      {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
    </>
  );
}
