const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. ADD STATES
code = code.replace(
  'const [followerCount, setFollowerCount] = useState(0);',
  `const [followerCount, setFollowerCount] = useState(0);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'paypal'|'crypto'|'local_bank'>('paypal');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [globalAdPool, setGlobalAdPool] = useState<{distributablePool: number}>({ distributablePool: 0 });
  const [totalPlatformAdViews, setTotalPlatformAdViews] = useState(0);`
);

// 2. ADD EFFECT
code = code.replace(
  'const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));',
  `const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));
    
    const adPoolUnsub = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalAdPool(docSnap.data() as any);
      }
    });
    
    const allPostsUnsub = onSnapshot(collection(db, 'posts'), (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(d => {
        const p = d.data();
        if (p.monetizationType === 'ad' || p.monetizationType === 'ad_supported') {
          total += (p.viewsCount || 0);
        }
      });
      setTotalPlatformAdViews(total);
    });`
);
code = code.replace(
  'return () => unsubscribe();',
  'return () => { unsubscribe(); adPoolUnsub(); allPostsUnsub(); };'
);

// 3. FIX STATS
const oldStatsStr = `  const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let adRevenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;

    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (p.monetizationType === 'ad_supported') {
        adRevenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
        adPosts++;
      }
    });
    return { 
      totalRevenue: paidRevenue + adRevenue, 
      paidRevenue, 
      adRevenue,
      paidUnlocks, 
      adUnlocks,
      paidPosts,
      adPosts
    };
  }, [monetizationPosts]);`;

code = code.replace(oldStatsStr, `  const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;
    let userAdViews = 0;

    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (p.monetizationType === 'ad' || p.monetizationType === 'ad_supported') {
        userAdViews += (p.viewsCount || 0);
        adPosts++;
      }
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
  }, [monetizationPosts, totalPlatformAdViews, globalAdPool]);`);

// 4. ADD HANDLE SUBMIT
code = code.replace(
  'const confirmDelete = async () => {',
  `const handleRequestPayout = async () => {
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
    } catch (err) {
      console.error('Error submitting payout request:', err);
      toast.error('Failed to submit request');
    } finally {
      setIsSubmittingPayout(false);
    }
  };

  const confirmDelete = async () => {`
);

// 5. REPLACE INFO BOX WITH BANNER + BUTTONS
const startIdx = code.indexOf('{showMonetizationInfo && (');
const endStr = '              )}';
const endIdx = code.indexOf(endStr, startIdx);
if (startIdx > -1 && endIdx > -1) {
  const toReplace = code.substring(startIdx, endIdx + endStr.length);
  code = code.replace(
    toReplace,
    `{monetizationStats.isAdRevenuePending && (
                <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.05)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ color: '#eab308', flexShrink: 0, marginTop: '0.25rem' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Ad Revenue Pending</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Your ad earnings will appear once you reach a total of 1,000 views across all your posts (Current: {monetizationStats.adViews.toLocaleString()}).
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <button 
                  className="btn-solid" 
                  onClick={() => setIsPayoutModalOpen(true)}
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600 }}
                >
                  <DollarSign size={16} /> Request Payout
                </button>
                <button 
                  onClick={() => setIsMonetizationModalOpen(true)}
                  style={{ 
                    color: 'var(--text-secondary)', 
                    textDecoration: 'underline', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '0.95rem', 
                    padding: 0,
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  How Creator Monetization Works
                </button>
              }`
  );
}

// 6. ADD MODALS
code = code.replace(
  '</main>',
  `        {isPayoutModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
              <h3 className={styles.modalTitle} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: '#10b981' }} />
                Request Payout
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Available Balance:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>\${monetizationStats.totalRevenue.toFixed(2)}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {monetizationStats.totalRevenue >= 5 
                    ? "You have reached the minimum $5.00 threshold. Withdrawals are reviewed and processed at the end of the current month."
                    : \`You need $\${(5 - monetizationStats.totalRevenue).toFixed(2)} more to reach the $5.00 minimum withdrawal threshold.\`}
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>Select Payout Method</label>
                  <select 
                    value={payoutMethod}
                    onChange={(e) => {
                      setPayoutMethod(e.target.value as any);
                      setPayoutDetails('');
                    }}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                  >
                    <option value="paypal">PayPal</option>
                    <option value="crypto">Crypto (USDT - TRC20/Solana)</option>
                    <option value="local_bank">Local Bank Transfer (via Wise)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    {payoutMethod === 'paypal' ? 'Enter your PayPal Email' : 
                     payoutMethod === 'crypto' ? 'Enter your USDT Wallet Address' : 
                     'Enter your Bank Name, Account Number, and Routing/Swift Code'}
                  </label>
                  {payoutMethod === 'local_bank' ? (
                    <textarea 
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      placeholder="e.g. Chase Bank, Acc: 123456789, Routing: 987654321..."
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem', resize: 'vertical' }}
                    />
                  ) : (
                    <input 
                      type={payoutMethod === 'paypal' ? 'email' : 'text'}
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                      placeholder={payoutMethod === 'paypal' ? "creator@example.com" : "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
                    />
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  className={styles.modalCancelBtn} 
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setPayoutDetails('');
                  }}
                  disabled={isSubmittingPayout}
                >
                  Cancel
                </button>
                <button 
                  className="btn-solid" 
                  onClick={handleRequestPayout}
                  disabled={isSubmittingPayout || !payoutDetails.trim() || monetizationStats.totalRevenue < 5}
                  style={{ opacity: (isSubmittingPayout || !payoutDetails.trim() || monetizationStats.totalRevenue < 5) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isSubmittingPayout ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isMonetizationModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className={styles.modalTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Info size={20} style={{ color: '#3b82f6' }} />
                  How Creator Monetization Works
                </h3>
                <button 
                  onClick={() => setIsMonetizationModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} /> Paid Prompts
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    As soon as a user buys the prompt from you, you will earn the prompt price minus the platform fees. We will also outline exactly how much Whop takes in processing fees.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlayCircle size={16} /> Ad-Supported Prompts
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Prompts stay 100% free for viewers. Revenue is the total revenue earned from advertisements all across different creators. It is pooled and calculated at the end of each month to see how much of that revenue would go to each user based on the views they were able to deliver. The creators with the highest views will often get the highest payouts.
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <DollarSign size={16} /> Payouts
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    You need to reach a minimum of <strong>$5.00</strong> in order to withdraw your money.
                  </p>
                </div>
              </div>

              <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
                <button className="btn-solid" onClick={() => setIsMonetizationModalOpen(false)} style={{ width: '100%' }}>
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </main>`
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed flawlessly!');
