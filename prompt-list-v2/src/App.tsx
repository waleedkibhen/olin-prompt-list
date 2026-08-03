import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import HomePage from '@/pages/HomePage';
import SavedPromptsPage from '@/pages/SavedPromptsPage';
import FollowingHubPage from '@/pages/FollowingHubPage';
import CreatorDashboardPage from '@/pages/CreatorDashboardPage';
import PostDetailPage from '@/pages/PostDetailPage';
import './index.css';

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/saved" element={<SavedPromptsPage />} />
          <Route path="/following" element={<FollowingHubPage />} />
          <Route path="/dashboard" element={<CreatorDashboardPage />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
        </Routes>
      </div>
    </div>
  );
}
