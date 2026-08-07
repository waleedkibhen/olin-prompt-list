import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { Search, Filter, Plus, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CreatePostModal from './CreatePostModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'for_you';
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop && scrollTop > 64) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`${styles.navbarContainer} ${isHidden ? styles.navHidden : ''}`} id="top-nav">
        <Link to="/" className={styles.brandTitle}>Olin</Link>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '9999px', padding: '0.4rem 1rem', flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
          <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
          <input 
            type="search" 
            placeholder="Search prompts, tags, or styles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </form>

        <div className={styles.actionControls}>
          <button className={styles.iconBtn} onClick={() => setIsCreateModalOpen(true)} title="Create Artwork">
            <Plus size={24} strokeWidth={1.5} />
          </button>
          
          {user && (
            <div style={{ position: 'relative' }}>
              <button className={styles.iconBtn} onClick={() => setShowNotifications(!showNotifications)} title="Notifications">
                <Bell size={24} strokeWidth={1.5} />
              </button>
              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '280px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', zIndex: 50, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Notifications</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>You have no new notifications.</p>
                </div>
              )}
            </div>
          )}
          
          <button className={styles.iconBtn} onClick={() => user ? navigate('/profile') : signInWithGoogle()} title={user ? "Profile" : "Sign In"}>
            <User size={24} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} />}
    </>
  );
}
