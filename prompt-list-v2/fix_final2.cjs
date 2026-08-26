const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. ADD STATE FOR AD POOL
code = code.replace(
  'const [monetizationFilter, setMonetizationFilter] = useState<\'all\' | \'paid\' | \'ad\'>(\'all\');',
  `const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'paid' | 'ad'>('all');
  const [globalAdPool, setGlobalAdPool] = useState<{distributablePool: number}>({ distributablePool: 0 });
  const [totalPlatformAdViews, setTotalPlatformAdViews] = useState(0);`
);

code = code.replace(
  'const q = query(collection(db, \'posts\'), where(\'creatorId\', \'==\', user.uid));',
  `const q = query(collection(db, 'posts'), where('creatorId', '==', user.uid));
    
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


// 2. FIX MONETIZATION STATS LOGIC
const oldStatsPart1 = `  const monetizationStats = React.useMemo(() => {
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

code = code.replace(oldStatsPart1, `  const monetizationStats = React.useMemo(() => {
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


// 3. REPLACE OLD "How Creator Monetization Works" INFO BOX WITH NEW BANNER AND BUTTON
const infoBoxBlock = `              {showMonetizationInfo && (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                  <div style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>How Creator Monetization Works</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <li><strong>Paid Prompts:</strong> You earn directly when users buy your prompt via Whop (minus platform fees).</li>
                      <li><strong>Ad-Supported Prompts:</strong> Prompts stay 100% free for viewers. Revenue is pooled and calculated at the end of each month based on your share of global page views.</li>
                      <li><strong>Payouts:</strong> Minimum withdrawal threshold is <strong>$10.00</strong>.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setShowMonetizationInfo(false)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Dismiss"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}`;

code = code.replace(
  infoBoxBlock,
  `              {monetizationStats.isAdRevenuePending && (
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

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed correctly!');
