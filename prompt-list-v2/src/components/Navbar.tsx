import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Search, Sparkles, Sun, Moon, Bookmark, Plus, LogOut, Users, BarChart2, X, ShieldAlert, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import NotificationBell from './NotificationBell';
import FeedbackModal from './FeedbackModal';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  
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
            <button 
              className="btn-icon" 
              onClick={toggleTheme} 
              title={`Current mode: ${theme}. Click to switch Light/Dark mode persistently.`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user && <NotificationBell />}

            <button
              type="button"
              className={styles.navLinkBtn}
              onClick={() => setIsFeedbackOpen(true)}
              title="Submit Feedback or Report a Bug"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <MessageSquarePlus size={16} />
              <span className={styles.btnText}>Support</span>
            </button>

            {isAdmin && (
              <Link to="/admin" className={styles.navLinkBtn} title="Secure Admin Dashboard" style={{ color: '#f59e0b', fontWeight: 700 }}>
                <ShieldAlert size={16} style={{ color: '#f59e0b' }} />
                <span className={styles.btnText}>Admin</span>
              </Link>
            )}

            <Link to="/saved" className={styles.navLinkBtn} title="Saved library">
              <Bookmark size={16} />
              <span className={styles.btnText}>Saved</span>
            </Link>

            <Link to="/following" className={styles.navLinkBtn} title="Followed creators hub">
              <Users size={16} />
              <span className={styles.btnText}>Following</span>
            </Link>

            <button className="btn-solid" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Create</span>
            </button>

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
                      title={profile?.displayName || user.displayName || 'Google Account'}
                    >
                      <img 
                        src={profile?.avatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                        alt="Avatar" 
                        className={styles.avatarImg}
                      />
                    </button>

                    {isMenuOpen && (
                      <div className={styles.userMenu}>
                        <div className={styles.menuHeader}>
                          <strong>{profile?.displayName || user.displayName}</strong>
                          <span>@{profile?.username || 'creator'}</span>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className={styles.menuItem} onClick={() => setIsMenuOpen(false)} style={{ color: '#f59e0b', fontWeight: 700 }}>
                            <ShieldAlert size={16} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link to="/dashboard" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <BarChart2 size={16} />
                          <span>Dashboard</span>
                        </Link>
                        <Link to="/saved" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <Bookmark size={16} />
                          <span>Saved Bookmarks</span>
                        </Link>
                        <Link to="/following" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                          <Users size={16} />
                          <span>Following</span>
                        </Link>
                        <button type="button" className={styles.menuItem} onClick={() => { setIsFeedbackOpen(true); setIsMenuOpen(false); }}>
                          <MessageSquarePlus size={16} />
                          <span>Submit Bug / Support</span>
                        </button>
                        <button className={styles.menuItem} onClick={() => { signOut(); setIsMenuOpen(false); }}>
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

