import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ENABLE_ADS } from '@/lib/config';
import GlobalAdManager from '@/components/GlobalAdManager';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import OnboardingModal from '@/components/OnboardingModal';
import GlobalAdDisclaimer from '@/components/GlobalAdDisclaimer';
import './index.css';

// Lazy load non-critical routes for massive performance boost
const CreatorDashboardPage = lazy(() => import('@/pages/CreatorDashboard'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const CreatePostPage = lazy(() => import('@/pages/CreatePostPage'));
const CreatorProfilePage = lazy(() => import('@/pages/CreatorProfilePage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const AdTestPage = lazy(() => import('@/pages/AdTestPage'));

export default function App() {
  // Prevent leaked ad listeners on document from triggering on the Discover page
  React.useEffect(() => {
    if (!ENABLE_ADS) return;
    const handleBodyClick = (e: MouseEvent) => {
      // If a post modal is not open, stop clicks from bubbling up to document
      // where Monetag's rogue global listeners are hiding.
      const isDashboard = window.location.pathname === '/dashboard';
        if (!document.body.classList.contains('post-modal-open') && !isDashboard) {
          e.stopPropagation();
        }
    };
    // React 18 handles events at the #root level. 
    // By attaching to body, we let React process the click, but stop it before it hits document.
    document.body.addEventListener('click', handleBodyClick);
    return () => document.body.removeEventListener('click', handleBodyClick);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalAdManager />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary, #1a1a1a)',
            color: 'var(--text-primary, #f0f0f0)',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontFamily: 'Geist Sans, sans-serif',
            fontWeight: 400,
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a1a1a' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#1a1a1a' } },
          duration: 3500,
        }}
      />
      <Navbar />
      <OnboardingModal />
      <GlobalAdDisclaimer />
      <div style={{ flex: 1, paddingTop: 'var(--header-total-height, calc(64px + var(--banner-height, 0px)))' }}>
        <Suspense fallback={<div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:id" element={<><HomePage /><PostDetailPage /></>} />
            <Route path="/create" element={<CreatePostPage />} />
            <Route path="/dashboard" element={<CreatorDashboardPage />} />
            <Route path="/creator/:username" element={<CreatorProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/about" element={<AboutPage />} />
              <Route path="/ad-test" element={<AdTestPage />} />
              </Routes>
        </Suspense>
      </div>
    </div>
  );
}

