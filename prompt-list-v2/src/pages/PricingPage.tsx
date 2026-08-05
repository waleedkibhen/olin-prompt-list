import React, { useState, useEffect } from 'react';
import styles from './pricing.module.css';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Sparkles, ShieldCheck, ExternalLink, X, AlertCircle } from 'lucide-react';

// Live Whop Checkout URLs & Plan IDs
// Plan ID Monthly: plan_GQc9sa68Db1k5
// Plan ID Yearly: plan_8r7fZPEtKV1Cs
const WHOP_CHECKOUT_URLS = {
  monthly: 'https://whop.com/checkout/plan_GQc9sa68Db1k5',
  yearly: 'https://whop.com/checkout/plan_8r7fZPEtKV1Cs',
};

export default function PricingPage() {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showToastModal, setShowToastModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' || params.get('checkout') === 'success' || params.get('upgraded') === 'true') {
      setShowSuccessModal(true);
      localStorage.setItem('olin_recent_success', 'true');
      const pendingTier = localStorage.getItem('olin_pending_tier') || 'monthly';
      localStorage.setItem('olin_active_tier', pendingTier);
      if (user) {
        localStorage.setItem(`olin_subscription_${user.uid}`, 'active');
        localStorage.setItem(`olin_sub_tier_${user.uid}`, pendingTier);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  useEffect(() => {
    if (user && localStorage.getItem('olin_recent_success') === 'true') {
      localStorage.setItem(`olin_subscription_${user.uid}`, 'active');
      const tier = localStorage.getItem('olin_active_tier') || 'monthly';
      localStorage.setItem(`olin_sub_tier_${user.uid}`, tier);
    }
  }, [user]);

  // Check if the currently logged-in user is already an approved Premium Subscriber
  const isPremiumSubscriber = Boolean(
    profile?.subscriptionStatus === 'active' || 
    profile?.isPremium === true ||
    (user && localStorage.getItem(`olin_subscription_${user.uid}`) === 'active') ||
    localStorage.getItem('olin_recent_success') === 'true'
  );

  const activeTier = (profile as any)?.subscriptionTier || (user && localStorage.getItem(`olin_sub_tier_${user.uid}`)) || localStorage.getItem('olin_active_tier') || 'monthly';

  const handleSubscribe = (planType: 'monthly' | 'yearly') => {
    localStorage.setItem('olin_pending_tier', planType);
    let url = WHOP_CHECKOUT_URLS[planType];
    if (!url) {
      setShowToastModal(true);
      return;
    }
    
    // Automatically pre-fill user email in Whop checkout if authenticated
    if (user?.email) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}email=${encodeURIComponent(user.email)}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleManageWhop = () => {
    window.open('https://whop.com/orders', '_blank', 'noopener,noreferrer');
  };

  const handleFreeCta = () => {
    if (!user) {
      signInWithGoogle();
    } else {
      navigate('/');
    }
  };

  return (
    <div className={styles.pricingWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.title}>Unlock the Ultimate AI Prompt Vault</h1>
        <p className={styles.subtitle}>
          Get unlimited access to premium generative parameters, copy monetized prompts without watching ads, and support top AI artists.
        </p>

        {/* Interactive Billing Toggle */}
        <div className={styles.billingToggleContainer}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${billingCycle === 'monthly' ? styles.activeToggle : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${billingCycle === 'yearly' ? styles.activeToggle : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >
            <span>Yearly Billing</span>
            <span className={styles.savingsBadge}>2 Months Free</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards (Two-Column Layout) */}
      <section className={styles.cardsContainer}>
        {/* Card 1: Free (Community Member) */}
        <div className={styles.pricingCard}>
          <h2 className={styles.planName}>
            <span>Free (Community Member)</span>
          </h2>
          <p className={styles.planDescription}>
            For casual creators and community explorers.
          </p>
          
          <div className={styles.priceDisplay}>
            <span className={styles.amount}>$0</span>
            <span className={styles.period}>/ forever</span>
          </div>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Browse all open community artwork &amp; visual feeds</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Copy Free prompts instantly</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Access Ad-Supported monetized prompts (via 3-second sponsor showcase)</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Upload &amp; share your own AI creations</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span>Track personal portfolio analytics</span>
            </li>
          </ul>

          {user && !isPremiumSubscriber ? (
            <button type="button" className={`${styles.ctaBtn} ${styles.disabledCta}`} disabled>
              Current Plan
            </button>
          ) : isPremiumSubscriber ? (
            <button type="button" className={`${styles.ctaBtn} ${styles.disabledCta}`} disabled>
              Included with Premium
            </button>
          ) : (
            <button type="button" className={`${styles.ctaBtn} ${styles.secondaryCta}`} onClick={handleFreeCta}>
              Get Started Free
            </button>
          )}
        </div>

        {/* Card 2: Olin Premium Subscriber */}
        <div className={`${styles.pricingCard} ${styles.premiumCard}`}>
          <div className={styles.badgeHeader}>
            ⚡ LAUNCH PRICING • MOST POPULAR
          </div>

          <h2 className={styles.planName}>
            <Sparkles size={22} style={{ color: '#fbbf24' }} />
            <span>Olin Premium Subscriber</span>
          </h2>
          <p className={styles.planDescription}>
            Full, uninterrupted access to the entire monetized prompt ecosystem.
          </p>
          
          <div className={styles.priceDisplay}>
            {billingCycle === 'yearly' ? (
              <>
                <span className={styles.strikethrough}>$60</span>
                <span className={styles.amount}>$50</span>
                <span className={styles.period}>/ year</span>
              </>
            ) : (
              <>
                <span className={styles.amount}>$5</span>
                <span className={styles.period}>/ month</span>
              </>
            )}
          </div>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span><strong>Zero Ads Forever:</strong> Bypass all 3-second sponsor ad requirements</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span><strong>Unlock Premium Vaults:</strong> Copy parameters from exclusive "Subscribers Only" artwork</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span><strong>Direct Creator Support:</strong> Your subscription pool directly pays the artists whose prompts you use</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span><strong>Grandfathered Pricing:</strong> Lock in this early-adopter $5 launch rate forever</span>
            </li>
            <li className={styles.featureItem}>
              <Check size={18} className={styles.checkIcon} />
              <span><strong>Cancel Anytime:</strong> No long-term commitments</span>
            </li>
          </ul>

          {isPremiumSubscriber ? (
            activeTier === billingCycle ? (
              <button type="button" className={`${styles.ctaBtn} ${styles.primaryCta}`} onClick={handleManageWhop}>
                <ExternalLink size={18} />
                <span>✨ Current Active Plan — Manage on Whop</span>
              </button>
            ) : activeTier === 'monthly' && billingCycle === 'yearly' ? (
              <button 
                type="button" 
                className={`${styles.ctaBtn} ${styles.primaryCta}`} 
                onClick={() => handleSubscribe('yearly')}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 800 }}
              >
                <Zap size={18} />
                <span>⚡ Upgrade to Yearly Plan ($50/yr) — Save $10 ↗</span>
              </button>
            ) : (
              <button 
                type="button" 
                className={`${styles.ctaBtn} ${styles.primaryCta}`} 
                onClick={() => handleSubscribe('monthly')}
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                <ExternalLink size={18} />
                <span>📉 Downgrade to Monthly Plan ($5/mo) ↗</span>
              </button>
            )
          ) : (
            <button 
              type="button" 
              className={`${styles.ctaBtn} ${styles.primaryCta}`} 
              onClick={() => handleSubscribe(billingCycle)}
            >
              <Zap size={18} />
              <span>
                ⚡ Subscribe via Whop — {billingCycle === 'yearly' ? '$50/yr' : '$5/mo'}
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Custom Toast Modal for Finalizing Checkout Links */}
      {showToastModal && (
        <div className={styles.toastOverlay} onClick={() => setShowToastModal(false)}>
          <div className={styles.toastCard} onClick={e => e.stopPropagation()}>
            <Sparkles size={40} style={{ color: '#fbbf24' }} />
            <h3 className={styles.toastTitle}>Checkout Link Status</h3>
            <p className={styles.toastMessage}>
              Whop checkout links are being finalized. Check back shortly!
            </p>
            <button 
              type="button" 
              className={styles.toastBtn}
              onClick={() => setShowToastModal(false)}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Celebration Success Modal after Whop Payment */}
      {showSuccessModal && (
        <div className={styles.toastOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.toastCard} onClick={e => e.stopPropagation()} style={{ border: '2px solid #fbbf24', maxWidth: '480px' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '1rem', borderRadius: '50%', marginBottom: '0.25rem' }}>
              <Sparkles size={52} style={{ color: '#fbbf24' }} />
            </div>
            <h3 className={styles.toastTitle} style={{ fontSize: '1.6rem', color: '#d97706' }}>
              🎉 Welcome to Olin Pro!
            </h3>
            <p className={styles.toastMessage} style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              Your subscription payment was processed successfully! You are now an official <strong>Olin Premium Subscriber</strong>. All sponsor ads are bypassed forever, and protected creator vaults are instantly unlocked for you.
            </p>
            <button 
              type="button" 
              className={styles.toastBtn}
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              style={{ width: '100%', background: 'var(--accent-color)', color: 'var(--text-inverted)', marginTop: '0.5rem' }}
            >
              ⚡ Start Creating &amp; Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
