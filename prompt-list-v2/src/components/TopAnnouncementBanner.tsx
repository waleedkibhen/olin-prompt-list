import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import MonetizationInfoModal from '@/pages/CreatorDashboard/MonetizationInfoModal';
import styles from './TopAnnouncementBanner.module.css';

interface TopAnnouncementBannerProps {
  onVisibilityChange?: (isVisible: boolean) => void;
}

const STORAGE_KEY = 'olin_monetization_banner_dismissed_at';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export default function TopAnnouncementBanner({ onVisibilityChange }: TopAnnouncementBannerProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (!dismissedAt) {
      setIsVisible(true);
      onVisibilityChange?.(true);
      return;
    }

    const elapsed = Date.now() - parseInt(dismissedAt, 10);
    if (elapsed > THIRTY_DAYS_MS) {
      localStorage.removeItem(STORAGE_KEY);
      setIsVisible(true);
      onVisibilityChange?.(true);
    } else {
      setIsVisible(false);
      onVisibilityChange?.(false);
    }
  }, [onVisibilityChange]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVisible(false);
    onVisibilityChange?.(false);
  };

  const handleStartPosting = () => {
    navigate('/create');
  };

  if (!isVisible) {
    return isModalOpen ? <MonetizationInfoModal onClose={() => setIsModalOpen(false)} /> : null;
  }

  return (
    <>
      <aside className={styles.bannerWrapper} role="region" aria-label="Announcement">
        <div className={styles.bannerContent}>
          {/* Tag & Text */}
          <div className={styles.textGroup}>
            <span className={styles.badge}>
              <Sparkles size={12} className={styles.badgeIcon} />
              <span>NEW</span>
            </span>
            <span className={styles.bannerText}>
              Users can now make money on Olin! Start posting and start earning.
            </span>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionGroup}>
            <button 
              type="button" 
              className={styles.howItWorksBtn}
              onClick={() => setIsModalOpen(true)}
            >
              How it works
            </button>
            <button 
              type="button" 
              className={styles.startPostingBtn}
              onClick={handleStartPosting}
            >
              <span>Start Posting</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Dismiss X */}
        <button 
          type="button" 
          className={styles.closeBtn} 
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          title="Dismiss banner for 30 days"
        >
          <X size={14} />
        </button>
      </aside>

      {isModalOpen && <MonetizationInfoModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
