import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import CreatorDashboardPage from '@/pages/CreatorDashboardPage';
import PostDetailPage from '@/pages/PostDetailPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import PricingPage from '@/pages/PricingPage';
import CreatePostPage from '@/pages/CreatePostPage';
import CreatorProfilePage from '@/pages/CreatorProfilePage';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import OnboardingModal from '@/components/OnboardingModal';
import './index.css';

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
        </Routes>
      </div>
    </div>
  );
}

