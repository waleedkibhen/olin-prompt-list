"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Search, Sparkles, Sun, Moon, Bookmark, Plus, LogOut, ShieldCheck, Users, BarChart2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CreatePostModal from './CreatePostModal';

export default function Navbar() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('All Models');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize theme directly from localStorage or document data-theme attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  // Persistent Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('olin_theme', nextTheme);
    }
  };

  // Auto-focus search input when user clicks search icon
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const url = `/?search=${encodeURIComponent(searchQuery)}&model=${encodeURIComponent(selectedModel)}`;
    window.location.href = url;
  };

  return (
    <>
      <header className={styles.navbarContainer}>
        <div className={styles.navbarInner}>
          {/* Brand Identity */}
          <a href="/" className={styles.brand}>
            <div className={styles.logoBadge}>
              <Sparkles size={18} className={styles.logoIcon} />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>Olin</span>
              <span className={styles.brandSubtitle}>Prompt List</span>
            </div>
          </a>

          {/* Expandable Search Toggle / Input */}
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
          
          {/* Action Navigation */}
          <div className={styles.actionControls}>
            <button 
              className="btn-icon" 
              onClick={toggleTheme} 
              title={`Current mode: ${theme}. Click to switch Light/Dark mode persistently.`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <a href="/saved" className={styles.navLinkBtn} title="Saved library">
              <Bookmark size={16} />
              <span className={styles.btnText}>Saved</span>
            </a>

            <a href="/following" className={styles.navLinkBtn} title="Followed creators hub">
              <Users size={16} />
              <span className={styles.btnText}>Following</span>
            </a>

            <button className="btn-solid" onClick={() => setIsCreateModalOpen(true)} style={{ padding: '0.45rem 0.95rem', borderRadius: '9999px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Create</span>
            </button>

            {/* User Account / Auth */}
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
                        <a href="/dashboard" className={styles.menuItem}>
                          <BarChart2 size={16} />
                          <span>Dashboard</span>
                        </a>
                        <a href="/saved" className={styles.menuItem}>
                          <Bookmark size={16} />
                          <span>Saved Bookmarks</span>
                        </a>
                        <a href="/following" className={styles.menuItem}>
                          <Users size={16} />
                          <span>Following</span>
                        </a>
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
    </>
  );
}
