import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Search, Filter, Plus, User, Bell, ChevronDown, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import FeedbackModal from './FeedbackModal';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { COLOR_OPTIONS, ASPECT_OPTIONS, TIME_OPTIONS } from '../lib/filters';

export default function Navbar() {
  const { user, profile, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeTab = searchParams.get('tab') || 'for_you';
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Profile / Notification state
  const [showNotifications, setShowNotifications] = useState(false);
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

  const RECENT_SEARCHES = ['red', 'glass morphism prompt icon', 'shaded icons', 'the odyssey'];

  return (
    <>
      <nav className={`${styles.navbarContainer} ${isHidden ? styles.navHidden : ''}`} id="top-nav">
        
        {/* Left side: Logo & Tabs */}
        {!isSearchExpanded && (
          <div className={styles.leftSection}>
            <Link to="/" className={styles.brandTitle}>
              <span className={styles.brandIcon}><Sparkles size={16} /></span>
              <span>Olin</span>
              <span className={styles.brandSuffix}>Prompt List</span>
            </Link>
            
            <div className={styles.navTabs}>
              {['for_you', 'trending', 'newest', 'saved'].map(tab => (
                <button 
                  key={tab}
                  className={`${styles.navTab} ${activeTab === tab ? styles.navTabActive : ''}`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab === 'for_you' ? 'For You' : tab === 'trending' ? 'Trending' : tab === 'newest' ? 'Newest' : 'Saved'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center/Right: Search Bar */}
        {isSearchExpanded ? (
          <div className={styles.expandedSearchContainer}>
            <form onSubmit={handleSearchSubmit} className={styles.searchFormExpanded}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search prompts, tags, or styles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className={styles.clearBtn}>
                  &times;
                </button>
              )}
            </form>
            <div className={styles.recentSearchesDropdown}>
              <h5 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Recent searches</h5>
              <div className={styles.recentSearchesGrid}>
                {RECENT_SEARCHES.map(term => (
                  <button 
                    key={term} 
                    className={styles.recentSearchPill}
                    onClick={() => {
                      setSearchQuery(term);
                      setSearchParams(prev => { prev.set('search', term); return prev; });
                      setIsSearchExpanded(false);
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.actionControls}>
            
            {/* Search Icon */}
            <button className={styles.iconBtn} onClick={() => { setIsSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 50); }} title="Search">
              <Search size={22} strokeWidth={2} />
            </button>
            
            {/* Filter Icon & Dropdown */}
            <div style={{ position: 'relative' }} ref={filterRef}>
              <button className={`${styles.iconBtn} ${isFilterOpen ? styles.iconBtnActive : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)} title="Filters">
                <Filter size={22} strokeWidth={2} />
              </button>
              {isFilterOpen && (
                <div className={styles.filterDropdownMenu}>
                  <div className={styles.filterSection}>
                    <h6 className={styles.filterSectionTitle}>Color Palette</h6>
                    <div className={styles.filterOptionsGrid}>
                      <button 
                        className={`${styles.filterSquare} ${activeColor === 'All' ? styles.filterSquareActive : ''}`}
                        onClick={() => handleFilterChange('color', 'All')}
                      >
                        Any Color
                      </button>
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c.name}
                          className={`${styles.filterSquare} ${activeColor === c.name ? styles.filterSquareActive : ''}`}
                          style={{ borderLeft: `4px solid ${c.hex}` }}
                          onClick={() => handleFilterChange('color', c.name)}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.filterSection}>
                    <h6 className={styles.filterSectionTitle}>Orientation</h6>
                    <div className={styles.filterOptionsFlex}>
                      {ASPECT_OPTIONS.map(a => (
                        <button
                          key={a.value}
                          className={`${styles.filterSquare} ${activeAspect === a.value ? styles.filterSquareActive : ''}`}
                          onClick={() => handleFilterChange('aspect', a.value)}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.filterSection}>
                    <h6 className={styles.filterSectionTitle}>Timeframe</h6>
                    <div className={styles.filterOptionsFlex}>
                      {TIME_OPTIONS.map(t => (
                        <button
                          key={t.value}
                          className={`${styles.filterSquare} ${activeTime === t.value ? styles.filterSquareActive : ''}`}
                          onClick={() => handleFilterChange('time', t.value)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Create Post */}
            <button className={styles.iconBtn} onClick={() => setIsCreateModalOpen(true)} title="Create Artwork">
              <Plus size={24} strokeWidth={2} />
            </button>
            
            {/* Notifications */}
            {user && (
              <div style={{ position: 'relative' }}>
                <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
                  <Bell size={22} strokeWidth={2} />
                </button>
                {showNotifications && (
                  <div className={styles.dropdownMenu}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Notifications</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>You have no new notifications.</p>
                  </div>
                )}
              </div>
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
                  <Link to={`/profile?id=${user.uid}`} className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Creator Dashboard</Link>
                  <Link to="/settings" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Profile Settings</Link>
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
        )}
      </nav>

      {/* Expanded Search Backdrop */}
      {isSearchExpanded && (
        <div className={styles.searchBackdrop} onClick={() => setIsSearchExpanded(false)} />
      )}

      {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />}
      {isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}
    </>
  );
}
