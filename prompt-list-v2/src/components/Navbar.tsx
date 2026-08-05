import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Search, Sparkles, Sun, Moon, Bookmark, Plus, LogOut, Users, BarChart2, X, ShieldAlert, MessageSquarePlus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import NotificationBell from './NotificationBell';
import FeedbackModal from './FeedbackModal';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';

export default function Navbar() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  
  const isPro = ENABLE_MONETIZATION && Boolean(
    profile?.isPremium === true || 
    profile?.subscriptionStatus === 'active' || 
    (user && localStorage.getItem(`olin_subscription_${user.uid}`) === 'active') ||
    localStorage.getItem('olin_recent_success') === 'true'
  );

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('All Models');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('olin_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light' || current === 'dark') {
        setTheme(current);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('olin_theme', nextTheme);
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/?search=${encodeURIComponent(searchQuery)}&model=${encodeURIComponent(selectedModel)}`);
  };

  const isAdmin = user?.email === 'wisecrafts81@gmail.com';

  return (
    <>
      <header className={styles.navbarContainer}>
        <div className={styles.navbarInner}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logoBadge}>
              <Sparkles size={18} className={styles.logoIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Olin</span>
              <span className={styles.brandSubtitle}>Prompt List</span>
            </div>
          </Link>

          <div className={styles.searchExpandContainer}>
            {!isSearchOpen ? (
              <button 
                type="button"
                className={styles.searchIconToggle}
                onClick={() => setIsSearchOpen(true)}
                title="Search artwork and prompt structures"
              >
                <Search size={16} />
                <span className={styles.btnText}>Search</span>
              </button>
            ) : (
              <form className={styles.searchFormExpanded} onSubmit={handleSearchSubmit}>
                <div className={styles.searchIconWrapper}>
                  <Search size={16} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search AI prompts, styles, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                />
                <div className={styles.searchActions}>
                  <select 
                    className={styles.modelFilterSelect}
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="All Models">All Models</option>
                    <option value="Midjourney V6">Midjourney</option>
                    <option value="Flux.1">Flux.1</option>
                    <option value="DALL-E 3">DALL-E 3</option>
                    <option value="Stable Diffusion XL">SDXL</option>
                  </select>
                  <button type="submit" className={styles.searchSubmitBtn}>
                    Go
                  </button>
                  <button 
                    type="button" 
                    className={styles.closeSearchBtn} 
                    onClick={() => setIsSearchOpen(false)}
                    title="Close search"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
          
          <div className={styles.actionControls}>
            {user && <NotificationBell />}

            {isAdmin && (
              <Link to="/admin" className={styles.navLinkBtn} title="Secure Admin Dashboard" style={{ color: '#f59e0b', fontWeight: 700 }}>
                <ShieldAlert size={16} style={{ color: '#f59e0b' }} />
                <span className={styles.btnText}>Admin</span>
              </Link>
            )}

            {ENABLE_MONETIZATION && (
              <Link to="/pricing" className={styles.navLinkBtn} title="Subscription Plans & Pricing">
                <Sparkles size={16} style={{ color: '#fbbf24' }} />
                <span className={styles.btnText}>Pricing</span>
              </Link>
            )}

            <Link to="/following" className={styles.navLinkBtn} title="Followed creators hub">
              <Users size={16} />
              <span className={styles.btnText}>Following</span>
            </Link>

            <button className="btn-solid" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Create</span>
            </button>

            {isPro && (
              <div 
                onClick={() => navigate('/profile')} 
                style={{
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                  border: '1px solid #fcd34d',
                  userSelect: 'none'
                }}
                title="Active Premium Subscriber — Click to view membership"
              >
                <span>💎 PRO</span>
              </div>
            )}

            {!loading && (
              <div className={styles.profileDropdownContainer}>
                {!user ? (
                  <button 
                    className="btn-outline" 
                    onClick={signInWithGoogle} 
                    style={{ fontWeight: 600, padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.85rem' }}
                    title="Sign in with Google"
                  >
                    <span>Sign In</span>
                  </button>
                ) : (
                  <div>
                    <button 
                      className={styles.userAvatarBtn} 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      title={isPro ? `${profile?.displayName || user.displayName} (Pro Subscriber)` : profile?.displayName || user.displayName || 'Google Account'}
                      style={{ position: 'relative' }}
                    >
                      <img 
                        src={profile?.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt="Avatar" 
                        className={styles.avatarImg}
                      />
                      {isPro && (
                        <span style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          background: '#fbbf24',
                          color: '#000',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 900,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          border: '1.5px solid var(--bg-primary)'
                        }}>
                          ⚡
                        </span>
                      )}
                    </button>

                    {isMenuOpen && (
                      <div className={styles.userMenu}>
                        <div className={styles.menuHeader}>
                          <strong>{profile?.displayName || user.displayName}</strong>
                          <span>@{profile?.username || 'creator'}</span>
                          {isPro && (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: 'rgba(251, 191, 36, 0.15)',
                              color: '#d97706',
                              border: '1px solid rgba(251, 191, 36, 0.4)',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              marginTop: '6px',
                              width: 'fit-content'
                            }}>
                              <Sparkles size={12} style={{ color: '#fbbf24' }} />
                              <span>PRO MEMBER</span>
                            </div>
                          )}
                        </div>
                        
                        <Link to="/profile" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <User size={16} />
                          <span>Profile &amp; Settings</span>
                        </Link>

                        {ENABLE_MONETIZATION && (
                          <Link to="/pricing" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                            <Sparkles size={16} style={{ color: '#fbbf24' }} />
                            <span>Subscription Plans</span>
                          </Link>
                        )}
                        
                        <Link to="/dashboard" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <BarChart2 size={16} />
                          <span>Creator Dashboard</span>
                        </Link>
                        
                        <Link to="/saved" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <Bookmark size={16} />
                          <span>Saved Bookmarks</span>
                        </Link>
                        
                        <Link to="/following" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <Users size={16} />
                          <span>Following Hub</span>
                        </Link>

                        <button 
                          type="button" 
                          className={styles.menuItem} 
                          onClick={() => { toggleTheme(); setIsMenuOpen(false); }}
                        >
                          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                          <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                        </button>

                        <button 
                          type="button" 
                          className={styles.menuItem} 
                          onClick={() => { setIsFeedbackOpen(true); setIsMenuOpen(false); }}
                        >
                          <MessageSquarePlus size={16} />
                          <span>Support &amp; Feedback</span>
                        </button>

                        {isAdmin && (
                          <Link to="/admin" className={styles.menuItem} onClick={() => setIsMenuOpen(false)} style={{ color: '#f59e0b', fontWeight: 700 }}>
                            <ShieldAlert size={16} />
                            <span>Superadmin Console</span>
                          </Link>
                        )}

                        <button className={styles.menuItem} onClick={() => { signOut(); setIsMenuOpen(false); }} style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.25rem', paddingTop: '0.6rem' }}>
                          <LogOut size={15} /> 
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {isCreateModalOpen && (
        <CreatePostModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            alert("New creation published successfully!");
          }}
        />
      )}

      {isFeedbackOpen && (
        <FeedbackModal onClose={() => setIsFeedbackOpen(false)} />
      )}
    </>
  );
}
