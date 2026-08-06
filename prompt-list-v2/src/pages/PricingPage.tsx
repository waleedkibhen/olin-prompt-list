import React, { useState, useEffect, useCallback } from 'react';
import styles from './pricing.module.css';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Sparkles, ExternalLink } from 'lucide-react';
import { ENABLE_MONETIZATION } from '@/lib/config';

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const verifyWhopPayment = useCallback(async () => {
    if (!user?.email) return;
    setIsVerifying(true);
    setVerificationStatus('pending');
    
    try {
      const res = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
      const data: any = await res.json();
      if (data && data.isPremium) {
        setVerificationStatus('success');
        localStorage.setItem('olin_recent_success', 'true');
        localStorage.setItem(`olin_subscription_${user.uid}`, 'active');
        if (data.planTier) {
          localStorage.setItem(`olin_sub_tier_${user.uid}`, data.planTier);
        }
      } else {
        setVerificationStatus('failed');
      }
    } catch (err) {
      console.error('Error verifying Whop payment:', err);
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' || params.get('checkout') === 'success' || params.get('upgraded') === 'true') {
      setShowSuccessModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (showSuccessModal && user?.email && verificationStatus === 'pending' && !isVerifying) {
      verifyWhopPayment();
      const timer = setTimeout(() => {
        verifyWhopPayment();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, user, verificationStatus, isVerifying, verifyWhopPayment]);

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

  if (!ENABLE_MONETIZATION) {
    return (
      <div className={styles.pricingWrapper} style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '2px solid #10b981', borderRadius: '1rem', padding: '3.5rem 2.5rem', maxWidth: '680px', textAlign: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.35)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '84px', height: '84px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Sparkles size={46} style={{ color: '#10b981' }} />
          </div>
          <div style={{ background: '#10b981', color: '#000', fontSize: '0.825rem', fontWeight: 900, textTransform: 'uppercase', padding: '5px 16px', borderRadius: '9999px', display: 'inline-block', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
            🎉 100% Free Community Period
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.25, fontWeight: 800 }}>
            No Paywalls. No Subscriptions.<br/>Everything is Free.
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.25rem' }}>
            We have made a strict community pledge: <strong>we will not enable paid subscriptions or accept payments until our creator platform reaches at least 100 Monthly Active Users (MAU)</strong>. For the time being, enjoy unlimited, unrestricted access to every AI prompt parameter, creator vault, and discovery filter completely free of charge!
          </p>
          <button 
            type="button" 
            className="btn-solid" 
            onClick={() => navigate('/')}
            style={{ width: '100%', maxWidth: '340px', padding: '0.95rem 1.5rem', fontSize: '1.05rem', borderRadius: '9999px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 700, margin: '0 auto' }}
          >
            🚀 Explore All Prompts for Free
          </button>
        </div>
      </div>
    );
  }

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

      {/* Celebration & Real-Time Verification Modal after Whop Payment */}
      {showSuccessModal && (
        <div className={styles.toastOverlay} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.toastCard} onClick={e => e.stopPropagation()} style={{ border: '2px solid #fbbf24', maxWidth: '500px', padding: '2rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(251, 191, 36, 0.15)', padding: '1rem', borderRadius: '50%', marginBottom: '0.5rem', display: 'inline-block' }}>
              <Sparkles size={48} style={{ color: '#fbbf24' }} />
            </div>
            
            {isVerifying ? (
              <>
                <h3 className={styles.toastTitle} style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  ⏳ Checking Whop Records...
                </h3>
                <p className={styles.toastMessage} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  We are securely communicating with Whop payment servers to confirm your transaction for <strong>{user?.email || 'your account'}</strong>.
                </p>
              </>
            ) : verificationStatus === 'success' || isPremiumSubscriber ? (
              <>
                <div style={{ background: '#059669', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '9999px', margin: '0 auto 0.5rem auto', width: 'fit-content' }}>
                  ✅ CONFIRMED VIA WHOP API
                </div>
                <h3 className={styles.toastTitle} style={{ fontSize: '1.6rem', color: '#d97706', margin: '0.25rem 0 0.75rem 0' }}>
                  🎉 Welcome to Olin Pro!
                </h3>
                <p className={styles.toastMessage} style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  Your membership receipt was officially verified against Whop servers! You are now an active <strong>Olin Premium Subscriber</strong>. All sponsor advertisements are bypassed forever and exclusive vaults are fully unlocked.
                </p>
              </>
            ) : (
              <>
                <div style={{ background: '#dc2626', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '9999px', margin: '0 auto 0.5rem auto', width: 'fit-content' }}>
                  ⏳ PENDING OR UNVERIFIED
                </div>
                <h3 className={styles.toastTitle} style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                  Payment Processing
                </h3>
                <p className={styles.toastMessage} style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  Whop servers haven't finished propagating your payment receipt yet for <strong>{user?.email}</strong>. It can take up to 60 seconds after completing checkout.
                </p>
                <button 
                  type="button" 
                  onClick={verifyWhopPayment}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.6rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, width: '100%', marginBottom: '0.5rem' }}
                >
                  🔄 Re-verify Membership with Whop Now
                </button>
              </>
            )}

            <button 
              type="button" 
              className={styles.toastBtn}
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/');
              }}
              style={{ width: '100%', background: 'var(--accent-color)', color: 'var(--text-inverted)', marginTop: '0.5rem' }}
            >
              ⚡ Continue to Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
