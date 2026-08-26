
import PerformanceTab from './PerformanceTab';
import MonetizationTab from './MonetizationTab';
import PayoutModal from './PayoutModal';
import MonetizationInfoModal from './MonetizationInfoModal';

import React, { useEffect, useState } from 'react';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import styles from './dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs, limit, orderBy, getAggregateFromServer, sum, count } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PromptPost } from '@/lib/mockData';
import { BarChart2, Eye, Heart, Bookmark, Copy, Trash2, ExternalLink, PlusCircle, Box, AlertTriangle, Sparkles, CheckCircle, Award, Users, TrendingUp, TrendingDown, Lock, PlayCircle, X, Info, DollarSign, MonitorPlay } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ENABLE_MONETIZATION } from '@/lib/config';
import toast from 'react-hot-toast';

export default function CreatorDashboardPage() {
  const { user, profile, updateProfileState, loading: authLoading, signInWithGoogle } = useAuth();
  
  const [creatorPosts, setCreatorPosts] = useState<(PromptPost & { createdAtMs: number })[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [activeTab, setActiveTab] = useState<'performance' | 'monetization'>('performance');
  const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'paid' | 'ad'>('all');
    const [showMonetizationInfo, setShowMonetizationInfo] = useState(true); // '1d', '7d', '30d', '1y', 'all'
  const [postToDelete, setPostToDelete] = useState<{ id: string, title: string } | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'paypal'|'usdt_trc20'|'usdt_solana'|'wise'>('paypal');
  const [payoutAgreed, setPayoutAgreed] = useState(false);
  const [payoutDetails, setPayoutDetails] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [globalAdPool, setGlobalAdPool] = useState<{distributablePool: number}>({ distributablePool: 0 });
  const [totalPlatformAdViews, setTotalPlatformAdViews] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingDb(false);
      return;
    }

    const fetchFollowers = async () => {
      try {
        const q = query(collection(db, 'follows'), where('followingId', '==', user.uid));
        const snap = await getDocs(q);
        setFollowerCount(snap.size);
      } catch (err) {
        console.error("Failed to fetch followers:", err);
      }
    };
    fetchFollowers();

    
    
    // Limit snapshot to avoid massive reads
    const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));
    
    const adPoolUnsub = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalAdPool(data as any);
        setTotalPlatformAdViews(data.totalPlatformAdViews || 0);
      }
    });
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: (PromptPost & { createdAtMs: number })[] = [];
      let viewsSum = 0;
      let likesSum = 0;
      let savesSum = 0;
      let copiesSum = 0;
      let recentCopiesSum = 0;
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

      snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const views = d.viewsCount || 1;
        const likes = d.likesCount || 0;
        const saves = d.savesCount || 0;
        const copies = d.copiesCount || 0;
        const createdAtMs = d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now();

        if (createdAtMs >= ninetyDaysAgo) {
          recentCopiesSum += copies;
        }

        viewsSum += views;
        likesSum += likes;
        savesSum += saves;
        copiesSum += copies;

        items.push({
          id: docSnap.id,
          title: d.title || 'Untitled Creation',
          description: d.description || '',
          promptText: d.promptText || '',
          prompts: d.prompts || undefined,
          imageUrls: d.imageUrls || [],
          model: d.model || 'Midjourney V6',
          styleTag: d.styleTag || 'Community',
          categories: d.categories || [],
          creator: {
            uid: d.creatorId || user.uid,
            displayName: d.creatorDisplayName || user.displayName || 'Creator',
            username: d.creatorUsername || 'creator',
            avatarUrl: d.creatorAvatarUrl || user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            followerCount: 0
          },
          likesCount: likes,
          savesCount: saves,
          viewsCount: views,
          copiesCount: copies,
          isPaid: d.isPaid || false,
          price: d.price || 0,
          monetizationType: d.monetizationType || (d.isPaid ? 'charge' : 'free'),
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : 'Recently',
          createdAtMs
        });
      });

      items.sort((a, b) => b.viewsCount - a.viewsCount);
      setCreatorPosts(items);
      setLoadingDb(false);
    }, (err) => {
      console.error("Dashboard synchronization error:", err);
      setLoadingDb(false);
    });

    return () => { unsubscribe(); adPoolUnsub(); };
  }, [user, authLoading]);

  const filteredPosts = React.useMemo(() => {
    if (timeFilter === 'all') return creatorPosts;
    const now = Date.now();
    let limit = 0;
    if (timeFilter === '1d') limit = 1 * 24 * 60 * 60 * 1000;
    if (timeFilter === '7d') limit = 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30d') limit = 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === '1y') limit = 365 * 24 * 60 * 60 * 1000;
    return creatorPosts.filter(p => (now - p.createdAtMs) <= limit);
  }, [creatorPosts, timeFilter]);

  const previousFilteredPosts = React.useMemo(() => {
    if (timeFilter === 'all') return [];
    const now = Date.now();
    let limit = 0;
    if (timeFilter === '1d') limit = 1 * 24 * 60 * 60 * 1000;
    if (timeFilter === '7d') limit = 7 * 24 * 60 * 60 * 1000;
    if (timeFilter === '30d') limit = 30 * 24 * 60 * 60 * 1000;
    if (timeFilter === '1y') limit = 365 * 24 * 60 * 60 * 1000;
    return creatorPosts.filter(p => (now - p.createdAtMs) > limit && (now - p.createdAtMs) <= limit * 2);
  }, [creatorPosts, timeFilter]);

  const stats = React.useMemo(() => {
    return filteredPosts.reduce((acc, p) => ({
      views: acc.views + (p.viewsCount || 0),
      likes: acc.likes + (p.likesCount || 0),
      saves: acc.saves + (p.savesCount || 0),
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [filteredPosts]);

  const previousStats = React.useMemo(() => {
    return previousFilteredPosts.reduce((acc, p) => ({
      views: acc.views + p.viewsCount,
      likes: acc.likes + p.likesCount,
      saves: acc.saves + p.savesCount,
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [previousFilteredPosts]);

  const calculateTrend = (current: number, previous: number) => {
    if (timeFilter === 'all') {
      return current > 0 ? 100 : null;
    }
    if (previous === 0) return current > 0 ? 100 : null;
    return Math.round(((current - previous) / previous) * 100);
  };

  

  
  const monetizationPosts = React.useMemo(() => {
    return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported');
  }, [creatorPosts]);

  const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = creatorPosts.length;
    let userAdViews = 0;

    creatorPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : p.monetizationType;
      if (mType === 'charge' || mType === 'subscribers_only') {
        const price = parseFloat(p.price?.toString() || '0');
        paidRevenue += (p.copiesCount || 0) * price * 0.85; // assuming 15% platform fee
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      }
      userAdViews += (p.viewsCount || 0);
    });

    const adRevenue = totalPlatformAdViews > 0 ? (userAdViews / totalPlatformAdViews) * (globalAdPool.distributablePool || 0) : 0;
    const isAdRevenuePending = userAdViews < 1000;

    return { 
      totalRevenue: paidRevenue + (!isAdRevenuePending ? adRevenue : 0), 
      paidRevenue, 
      adRevenue: !isAdRevenuePending ? adRevenue : 0,
      paidUnlocks, 
      adUnlocks: userAdViews,
      paidPosts,
      adPosts,
      adViews: userAdViews,
      isAdRevenuePending
    };
  }, [creatorPosts, totalPlatformAdViews, globalAdPool]);

  const displayMonetizationPosts = React.useMemo(() => {
    // All posts are monetized via global ad revenue now
    return creatorPosts;
  }, [creatorPosts]);


  const handleDeletePost = (postId: string, title: string) => {
    setPostToDelete({ id: postId, title });
  };

  const handleRequestPayout = async () => {
    if (!user || monetizationStats.totalRevenue < 5) return;
    setIsSubmittingPayout(true);
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      await addDoc(collection(db, 'payout_requests'), {
        userId: user.uid,
        requestedAmount: monetizationStats.totalRevenue,
        payoutMethod,
        payoutDetails,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success('Payout request submitted successfully!');
      setIsPayoutModalOpen(false);
        setPayoutDetails('');
        setPayoutAgreed(false);
    } catch (err) {
      console.error('Error submitting payout request:', err);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await deleteDoc(doc(db, 'posts', postToDelete.id));
      setPostToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete artwork: ${err.message}`);
    }
  };

    return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.title}>Creator Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your analytical performance and prompt monetization.
          </p>
          {user && (
            <div className={styles.tabContainer}>
              <button 
                className={`${styles.tab} ${activeTab === 'performance' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'monetization' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('monetization')}
              >
                Monetization
              </button>
            </div>
          )}
        </div>
        {user && activeTab === 'performance' && (
          <div className={styles.timeFilterContainer} style={{ marginTop: '1rem' }}>
            <select 
              className={styles.timeSelect} 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}
      </header>

      {!user && !authLoading ? (
        <div className={styles.emptyState}>
          <AlertTriangle size={48} style={{ color: '#f59e0b' }} />
          <h3>Google Authentication Required</h3>
          <p>To view your Creator Dashboard and analytical metrics, you must be logged in with your verified Google account.</p>
          <GoogleSignInButton />
        </div>
      ) : loadingDb || authLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
          <Box size={40} className="global-box-spin" style={{ color: 'var(--text-primary)' }} />
          <span style={{ fontWeight: 600 }}>Loading dashboard data...</span>
        </div>
      ) : (
        <>
          {activeTab === 'performance' ? (
            <PerformanceTab 
              stats={stats}
              previousStats={previousStats}
              followerCount={followerCount}
              creatorPosts={creatorPosts}
              filteredPosts={filteredPosts}
              timeFilter={timeFilter}
              calculateTrend={calculateTrend}
              handleDeletePost={handleDeletePost}
            />
          ) : (
            <MonetizationTab 
              monetizationStats={monetizationStats}
              displayMonetizationPosts={displayMonetizationPosts}
              setIsPayoutModalOpen={setIsPayoutModalOpen}
              setIsMonetizationModalOpen={setIsMonetizationModalOpen}
              monetizationFilter={monetizationFilter}
            />
          )}
        </>
      )}

      {postToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete Artwork</h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete "{postToDelete.title}"? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setPostToDelete(null)}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {isPayoutModalOpen && (
        <PayoutModal
          monetizationStats={monetizationStats}
          payoutMethod={payoutMethod}
          setPayoutMethod={setPayoutMethod}
          payoutDetails={payoutDetails}
          setPayoutDetails={setPayoutDetails}
          payoutAgreed={payoutAgreed}
          setPayoutAgreed={setPayoutAgreed}
          isSubmittingPayout={isSubmittingPayout}
          handleRequestPayout={handleRequestPayout}
          onClose={() => {
            setIsPayoutModalOpen(false);
            setPayoutDetails('');
            setPayoutAgreed(false);
          }}
        />
      )}

      {isMonetizationModalOpen && (
        <MonetizationInfoModal onClose={() => setIsMonetizationModalOpen(false)} />
      )}
    </main>
  );
}
