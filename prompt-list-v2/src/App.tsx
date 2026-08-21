import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import OnboardingModal from '@/components/OnboardingModal';
import './index.css';

// Lazy load non-critical routes for massive performance boost
const CreatorDashboardPage = lazy(() => import('@/pages/CreatorDashboardPage'));
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
const UnlockAdPage = lazy(() => import('@/pages/UnlockAdPage'));

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      <div style={{ flex: 1, paddingTop: '64px' }}>
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
              <Route path="/unlock/:id" element={<UnlockAdPage />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

