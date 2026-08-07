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
        <Link to="/" className={styles.brandTitle}>GALLERY</Link>
        
        <div className={styles.desktopTabs}>
          <Link to="/?tab=for_you" className={`${styles.navTab} ${activeTab === 'for_you' ? styles.navTabActive : ''}`}>For You</Link>
          <Link to="/?tab=trending" className={`${styles.navTab} ${activeTab === 'trending' ? styles.navTabActive : ''}`}>Trending</Link>
          <Link to="/?tab=newest" className={`${styles.navTab} ${activeTab === 'newest' ? styles.navTabActive : ''}`}>Newest</Link>
        </div>

        <div className={styles.actionControls}>
          <button className={styles.iconBtn} onClick={() => setIsCreateModalOpen(true)} title="Create Artwork">
            <Plus size={24} strokeWidth={1.5} />
          </button>
          
          <button className={styles.iconBtn} onClick={() => {}} title="Filters">
            <Filter size={24} strokeWidth={1.5} />
          </button>
          
          <button className={styles.iconBtn} onClick={() => {}} title="Search">
            <Search size={24} strokeWidth={1.5} />
          </button>

          {user && (
            <button className={styles.iconBtn} title="Notifications">
              <Bell size={24} strokeWidth={1.5} />
            </button>
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
