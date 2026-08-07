import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import CreatorDashboardPage from '@/pages/CreatorDashboardPage';
import PostDetailPage from '@/pages/PostDetailPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import ProfilePage from '@/pages/ProfilePage';
import PricingPage from '@/pages/PricingPage';
import OnboardingModal from '@/components/OnboardingModal';
import './index.css';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <OnboardingModal />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<CreatorDashboardPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </div>
    </div>
  );
}

