import React, { useState, useEffect } from 'react';
import styles from './AdminDashboardPage.module.css';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { sendNotification } from '@/lib/notifications';
import { ShieldAlert, Check, X, AlertTriangle, Users, MessageSquare, Flame, Ban, CheckCircle, ShieldCheck, Send, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import RichTextRenderer from '@/components/RichTextRenderer';
import { extractImagePalette } from '@/lib/colorAnalyzer';
import { analyzeArtworkMultimodalWithGemini, diagnoseGeminiApi } from '@/lib/ai';
import { ENABLE_MONETIZATION } from '@/lib/config';

interface AdminPost {
  id: string;
  title: string;
  description: string;
  promptText: string;
  creatorId: string;
  creatorDisplayName: string;
  creatorUsername: string;
  imageUrls: string[];
  isFlagged?: boolean;
  flagSource?: string;
  flaggedReason?: string;
  createdAt?: any;
}

interface AdminUser {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string;
  isBanned?: boolean;
  monetizationStatus?: 'ineligible' | 'pending_review' | 'approved' | 'rejected';
}

interface SupportTicket {
  id: string;
  uid: string;
  authorName: string;
  authorEmail: string;
  subject: string;
  description: string;
  status: string;
  adminResponse?: string | null;
  createdAt?: any;
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'flagged' | 'monetization' | 'tickets' | 'users'>('flagged');
  
  const [allPosts, setAllPosts] = useState<AdminPost[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  
  const [replyTextMap, setReplyTextMap] = useState<{ [ticketId: string]: string }>({});
  const [rejectReasonMap, setRejectReasonMap] = useState<{ [uid: string]: string }>({});

  useEffect(() => {
    if (loading || !user || user.email !== 'wisecrafts81@gmail.com') return;

    const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const items: AdminPost[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as AdminPost);
      });
      setAllPosts(items);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items: AdminUser[] = [];
      snapshot.forEach(docSnap => {
        items.push({ uid: docSnap.id, ...docSnap.data() } as AdminUser);
      });
      setAllUsers(items);
    });

    const unsubTickets = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {
      const items: SupportTicket[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as SupportTicket);
      });
      items.sort((a, b) => (a.status === 'open' ? -1 : 1));
      setTickets(items);
    });

    return () => {
      unsubPosts();
      unsubUsers();
      unsubTickets();
    };
  }, [user, loading]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Verifying Admin credentials...</div>;

  if (!user || user.email !== 'wisecrafts81@gmail.com') {
    return (
      <div className={styles.accessDenied}>
        <AlertTriangle size={56} style={{ color: '#f43f5e' }} />
        <h2>🛡️ Secure Admin Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px' }}>
          This console is restricted strictly to verified systems admin (wisecrafts81@gmail.com). Unauthorized access attempts are monitored and logged.
        </p>
        <Link to="/" className="btn-solid" style={{ marginTop: '1rem' }}>
          Return to Public Marketplace
        </Link>
      </div>
    );
  }

  const flaggedPosts = allPosts.filter(p => p.isFlagged === true);
  const monetizationRequests = allUsers.filter(u => u.monetizationStatus === 'pending_review');

  const handleApprovePost = async (post: AdminPost) => {
    try {
      await updateDoc(doc(db, 'posts', post.id), { isFlagged: false });
      await sendNotification(
        post.creatorId,
        "✨ Flagged Upload Approved",
        `Great news! Our admin team reviewed your post "${post.title}" and approved it. It is now published live in community feeds!`,
        "moderation"
      );
      alert(`Approved "${post.title}"!`);
    } catch (e: any) {
      alert(`Error approving: ${e.message}`);
    }
  };

  const handleRejectPost = async (post: AdminPost) => {
    const reason = prompt(`Optional feedback message for rejecting "${post.title}":`, "Did not meet community safety standards.");
    if (reason === null) return;
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      await sendNotification(
        post.creatorId,
        "❌ Flagged Upload Rejected",
        `Your submission "${post.title}" was permanently removed by admin review. Reason: ${reason || 'Policy infraction'}`,
        "moderation"
      );
      alert(`Deleted "${post.title}".`);
    } catch (e: any) {
      alert(`Error deleting: ${e.message}`);
    }
  };

  const handleApproveMonetization = async (targetUser: AdminUser) => {
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { monetizationStatus: 'approved' });
      await sendNotification(
        targetUser.uid,
        "🎉 Premium Creator Monetization Approved!",
        "Congratulations! Your application has been verified by Admin. You can now publish Premium subscription vaults and earn income on Olin Prompt List!",
        "system"
      );
      alert(`Approved monetization for @${targetUser.username}!`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleRejectMonetization = async (targetUser: AdminUser) => {
    const reason = rejectReasonMap[targetUser.uid] || prompt("Reason for rejection:", "Insufficient organic engagement or copy verification.");
    if (reason === null) return;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { monetizationStatus: 'rejected' });
      await sendNotification(
        targetUser.uid,
        "❌ Monetization Application Update",
        `Your creator monetization request was not approved at this time. Admin Note: ${reason || 'Ineligible metrics'}`,
        "system"
      );
      alert(`Rejected application for @${targetUser.username}.`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleReplyTicket = async (ticket: SupportTicket) => {
    const replyText = replyTextMap[ticket.id];
    if (!replyText || !replyText.trim()) {
      alert("Please enter a reply message.");
      return;
    }
    try {
      await updateDoc(doc(db, 'support_tickets', ticket.id), {
        status: 'answered',
        adminResponse: replyText.trim()
      });
      await sendNotification(
        ticket.uid,
        `📬 Admin Support Reply: "${ticket.subject}"`,
        `Admin Team responded to your ticket: "${replyText.trim()}"`,
        "system"
      );
      setReplyTextMap(prev => ({ ...prev, [ticket.id]: '' }));
      alert("Reply sent directly to user Notification Bell!");
    } catch (e: any) {
      alert(`Error responding: ${e.message}`);
    }
  };

  const handleToggleBan = async (targetUser: AdminUser) => {
    const newStatus = !targetUser.isBanned;
    const confirmMsg = newStatus
      ? `BAN @${targetUser.username} (${targetUser.email})? This will terminate their active sessions and prevent marketplace access.`
      : `UNBAN @${targetUser.username}? They will regain full marketplace access.`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { isBanned: newStatus });
      alert(`@${targetUser.username} is now ${newStatus ? 'BANNED' : 'UNBANNED'}.`);
    } catch (e: any) {
      alert(`Error updating user status: ${e.message}`);
    }
  };

  const [isScanningColors, setIsScanningColors] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  const handleRunDiagnostics = async () => {
    setIsDiagnosing(true);
    setDiagnosticData(null);
    try {
      const report = await diagnoseGeminiApi();
      setDiagnosticData(report);
    } catch (err: any) {
      setDiagnosticData({ error: err.message || String(err) });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleRescanAllColors = async () => {
    if (!window.confirm("Start Gemini Multimodal AI scan on ALL existing catalog posts? This deeply indexes objects (grass, tower, humans, lighting) and assigns human perceptual colors.")) return;
    setIsScanningColors(true);
    try {
      setScanStatus("Fetching catalog from Firestore...");
      const querySnapshot = await getDocs(collection(db, 'posts'));
      let successCount = 0;
      let blockedCount = 0;
      const total = querySnapshot.docs.length;
      for (const d of querySnapshot.docs) {
        const pData = d.data();
        const imgUrl = pData.imageUrls && pData.imageUrls.length > 0 ? pData.imageUrls[0] : null;
        if (imgUrl) {
          setScanStatus(`Analyzing via Gemini Multimodal AI (${successCount + blockedCount + 1}/${total}): "${pData.title || 'Untitled'}"...`);
          const visionRes = await analyzeArtworkMultimodalWithGemini(imgUrl);
          if (visionRes.error) {
            console.warn(`[Rescan Error on ${pData.title || 'Untitled'}]:`, visionRes.error);
            setScanStatus(`⚠️ Gemini Error on "${pData.title || 'Untitled'}": ${visionRes.error}`);
            await new Promise(res => setTimeout(res, 2500)); // Pause so admin can see the error
          }

          let colorProfile = visionRes.colorProfile;
          if (!colorProfile) {
            colorProfile = await extractImagePalette(imgUrl);
          }

          const existingCategories = Array.isArray(pData.categories) ? pData.categories : [];
          const newCategories = Array.from(new Set([...existingCategories, ...(visionRes.tags || []), ...(colorProfile?.colorNames || [])]));

          if (colorProfile || (visionRes.tags && visionRes.tags.length > 0)) {
            successCount++;
            await updateDoc(doc(db, 'posts', d.id), {
              colorProfile: colorProfile || pData.colorProfile || null,
              categories: newCategories
            });
          } else {
            blockedCount++;
          }
        }
      }
      if (blockedCount > 0) {
        setScanStatus(`✨ indexed & tagged ${successCount} items via Multimodal AI! (Note: ${blockedCount} items used offline fallback or had errors.)`);
      } else {
        setScanStatus(`✨ Successfully indexed all ${successCount} catalog items with deep visual tags & perceptual human colors!`);
      }
      setTimeout(() => setScanStatus(null), 15000);
    } catch (err: any) {
      alert(`Scan failed: ${err.message}`);
      setScanStatus(null);
    } finally {
      setIsScanningColors(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.shieldIcon}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>Secure Superadmin Console</h1>
            <p>Real-time system oversight, content moderation, and monetization pipeline management.</p>
          </div>
        </div>
        <div className={styles.adminBadge} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} />
            <span>Verified Admin: wisecrafts81@gmail.com</span>
          </div>
          <button
            type="button"
            onClick={handleRescanAllColors}
            disabled={isScanningColors}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: '#fff',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isScanningColors ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
            }}
          >
            {isScanningColors ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{isScanningColors ? 'Running Gemini AI Indexer...' : '⚡ Gemini Multimodal Deep Rescan & Color Index'}</span>
          </button>
          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={isDiagnosing}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#fff',
              border: 'none',
              padding: '0.45rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: isDiagnosing ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isDiagnosing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>{isDiagnosing ? 'Querying Google API...' : '🔍 Diagnose Gemini API & Models'}</span>
          </button>
        </div>
      </header>
      {scanStatus && (
        <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#f3e8ff', padding: '0.75rem 1rem', borderRadius: '12px', margin: '1rem 0', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Sparkles size={18} style={{ color: '#ec4899', flexShrink: 0 }} />
          <span>{scanStatus}</span>
        </div>
      )}
      {diagnosticData && (
        <div style={{ background: '#0f172a', border: '1px solid #3b82f6', color: '#e2e8f0', padding: '1rem', borderRadius: '12px', margin: '1rem 0', overflow: 'auto', maxHeight: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <strong style={{ color: '#60a5fa', fontSize: '0.95rem' }}>🔍 Google Gemini API Diagnostic Report:</strong>
            <button onClick={() => setDiagnosticData(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 }}>✕ Close</button>
          </div>
          <pre style={{ margin: 0, fontSize: '0.8rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}>
            {JSON.stringify(diagnosticData, null, 2)}
          </pre>
        </div>
      )}

      <div className={styles.tabBar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'flagged' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('flagged')}
        >
          <Flame size={16} />
          <span>Flagged Posts Queue</span>
          <span className={styles.countBadge}>{flaggedPosts.length}</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'monetization' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('monetization')}
        >
          <ShieldAlert size={16} />
          <span>Monetization Requests</span>
          <span className={styles.countBadge}>{monetizationRequests.length}</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'tickets' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <MessageSquare size={16} />
          <span>Support &amp; Bug Tickets</span>
          <span className={styles.countBadge}>{tickets.filter(t => t.status === 'open').length} open</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} />
          <span>User Management &amp; Ban Hammer</span>
          <span className={styles.countBadge}>{allUsers.length}</span>
        </button>
      </div>

      {activeTab === 'flagged' && (
        <section className={styles.gridSection}>
          {flaggedPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <CheckCircle size={42} style={{ color: '#10b981', opacity: 0.8 }} />
              <h3>Queue Cleared!</h3>
              <p>No flagged artwork currently pending admin safety review.</p>
            </div>
          ) : (
            flaggedPosts.map((post) => (
              <div key={post.id} className={styles.card}>
                <div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    {post.flagSource === 'user' || String(post.flaggedReason || '').startsWith('Reported by') ? (
                      <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', backgroundColor: 'rgba(56, 189, 248, 0.12)', border: '1px solid #38bdf8', borderRadius: '9999px' }}>
                        👤 Reported by User (Live in Feed)
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid #f59e0b', borderRadius: '9999px' }}>
                        🤖 AI Automated Filter (Hidden from Feed)
                      </span>
                    )}
                  </div>
                  <div className={styles.metaInfo}>
                    <span>Creator: @{post.creatorUsername} ({post.creatorDisplayName})</span>
                    <span style={{ color: '#f43f5e', fontWeight: 600 }}>Reason: {post.flaggedReason || 'Automated filter'}</span>
                  </div>
                </div>

                {post.imageUrls?.[0] && (
                  <img src={post.imageUrls[0]} alt="Flagged Visual" className={styles.imgPreview} />
                )}

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.5rem', borderRadius: '8px', margin: 0 }}>
                  <strong style={{ display: 'block', paddingBottom: '4px' }}>Prompt:</strong>
                  <RichTextRenderer content={post.promptText} style={{ padding: 0, minHeight: 'auto', maxHeight: '150px' }} />
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.btnApprove} onClick={() => handleApprovePost(post)}>
                    <Check size={16} /> Approve &amp; Live
                  </button>
                  <button type="button" className={styles.btnReject} onClick={() => handleRejectPost(post)}>
                    <X size={16} /> Delete &amp; Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'monetization' && (
        <section className={styles.gridSection}>
          {monetizationRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <ShieldCheck size={42} style={{ color: 'var(--accent-color)', opacity: 0.7 }} />
              <h3>All Up to Date</h3>
              <p>No creator monetization applications are waiting for evaluation.</p>
            </div>
          ) : (
            monetizationRequests.map((u) => (
              <div key={u.uid} className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="Avatar" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }} />
                  <div>
                    <h3 className={styles.cardTitle}>{u.displayName}</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>@{u.username}</span>
                  </div>
                </div>

                <div className={styles.metaInfo} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span>Email: <strong>{u.email}</strong></span>
                  <span>Status: <strong style={{ color: '#f59e0b' }}>Pending 50-Copy Milestone Verification</strong></span>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.btnApprove} onClick={() => handleApproveMonetization(u)}>
                    <Check size={16} /> Verify &amp; Approve
                  </button>
                  <button type="button" className={styles.btnReject} onClick={() => handleRejectMonetization(u)}>
                    <X size={16} /> Reject with Note
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'tickets' && (
        <section className={styles.gridSection}>
          {tickets.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={42} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>Inbox Zero!</h3>
              <p>No support tickets or bug reports from users.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t.id} className={styles.card} style={t.status !== 'open' ? { opacity: 0.7 } : {}}>
                <div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{t.subject}</h3>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: t.status === 'open' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: t.status === 'open' ? '#f59e0b' : '#10b981'
                    }}>
                      {t.status === 'open' ? 'OPEN' : 'ANSWERED'}
                    </span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span>From: <strong>{t.authorName}</strong> ({t.authorEmail})</span>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {t.description}
                </div>

                {t.adminResponse && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderLeft: '3px solid #10b981', padding: '0.65rem 0.85rem', borderRadius: '4px', fontSize: '0.82rem', color: '#34d399' }}>
                    <strong>Your Reply:</strong> {t.adminResponse}
                  </div>
                )}

                <div className={styles.replyBox} style={{ marginTop: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type reply directly to user's Notification Bell..."
                    className={styles.replyInput}
                    value={replyTextMap[t.id] || ''}
                    onChange={(e) => setReplyTextMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleReplyTicket(t)}
                  />
                  <button
                    type="button"
                    className="btn-solid"
                    onClick={() => handleReplyTicket(t)}
                    style={{ fontSize: '0.8rem', padding: '0.5rem', borderRadius: '6px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                  >
                    <Send size={14} /> Send Reply &amp; Resolve
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Creator Identity</th>
                <th>Email Address</th>
                <th>Monetization Status</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Ban Hammer</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div className={styles.avatarCell}>
                      <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} alt="User" />
                      <div>
                        <strong style={{ display: 'block' }}>{u.displayName}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    {u.monetizationStatus === 'approved' ? (
                      <span style={{ color: '#10b981', fontWeight: 700 }}>💎 Approved Creator</span>
                    ) : u.monetizationStatus === 'pending_review' ? (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>⏳ Pending Review</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Standard Free</span>
                    )}
                  </td>
                  <td>
                    {u.isBanned ? (
                      <span style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800 }}>
                        🚫 BANNED
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>🟢 Active</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {u.email !== 'wisecrafts81@gmail.com' && (
                      <button 
                        type="button"
                        className={u.isBanned ? styles.btnUnban : styles.btnBan}
                        onClick={() => handleToggleBan(u)}
                        style={{ display: 'inline-flex', width: 'auto', minWidth: '110px' }}
                      >
                        <Ban size={15} />
                        <span>{u.isBanned ? 'Unban User' : 'Ban User'}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
