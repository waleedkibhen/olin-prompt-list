const fs = require('fs');

let oldCode = fs.readFileSync('C:/Users/ACER/.gemini/antigravity/brain/ee7b1da3-3645-4699-8777-9ef747901d26/scratch/CreatorDashboardPage.bak.tsx', 'utf8');

const parts = oldCode.split(/return \(\s*<main className=\{styles\.container\}>/);
if (parts.length < 2) {
    console.log("Could not split by main return");
    process.exit(1);
}

let codePrefix = parts[0];

// We also need to remove the inline TrendIndicator
codePrefix = codePrefix.replace(/const TrendIndicator = \(\{ trend \}: \{ trend: number \| null \}\) => \{[\s\S]*?^  \};/m, '');

// And add our imports
const newImports = `
import PerformanceTab from './PerformanceTab';
import MonetizationTab from './MonetizationTab';
import PayoutModal from './PayoutModal';
import MonetizationInfoModal from './MonetizationInfoModal';
`;
codePrefix = codePrefix.replace("import React,", newImports + "\nimport React,");

const newReturn = `  return (
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
                className={\`\${styles.tab} \${activeTab === 'performance' ? styles.tabActive : ''}\`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button 
                className={\`\${styles.tab} \${activeTab === 'monetization' ? styles.tabActive : ''}\`}
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
`;

fs.writeFileSync('src/pages/CreatorDashboard/index.tsx', codePrefix + newReturn);
console.log("Rewrote index.tsx properly via split");
