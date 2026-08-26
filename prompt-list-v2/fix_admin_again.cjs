const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

// 1. Add state for ad pool config
if (!code.includes('globalAdPoolAmount')) {
  code = code.replace(
    'const [isScanningColors, setIsScanningColors] = useState(false);',
    `const [isScanningColors, setIsScanningColors] = useState(false);
  const [globalAdPoolAmount, setGlobalAdPoolAmount] = useState<string>('');
  const [isSavingAdPool, setIsSavingAdPool] = useState(false);`
  );

  // 2. Add effect to fetch the ad pool
  code = code.replace(
    'const ticketsUnsub = onSnapshot(collection(db, \'support_tickets\'), (snapshot) => {',
    `const adPoolUnsub = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
        if (docSnap.exists()) {
          setGlobalAdPoolAmount(docSnap.data().distributablePool?.toString() || '0');
        }
      });
      
      const ticketsUnsub = onSnapshot(collection(db, 'support_tickets'), (snapshot) => {`
  );
  code = code.replace(
    'return () => { postsUnsub(); usersUnsub(); ticketsUnsub(); reqsUnsub(); payoutsUnsub(); };',
    'return () => { postsUnsub(); usersUnsub(); ticketsUnsub(); reqsUnsub(); payoutsUnsub(); adPoolUnsub(); };'
  );
}

// 3. Add handleSaveAdPool function
if (!code.includes('handleSaveAdPool')) {
  code = code.replace(
    'const handleMarkPayoutPaid = async (reqId: string) => {',
    `const handleSaveAdPool = async () => {
    setIsSavingAdPool(true);
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'system', 'adPool'), {
        distributablePool: parseFloat(globalAdPoolAmount) || 0,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Ad Pool updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update ad pool');
    } finally {
      setIsSavingAdPool(false);
    }
  };

  const handleMarkPayoutPaid = async (reqId: string) => {`
  );
}

// 4. Inject the Ad Pool UI and the Payout Requests Tab Button
const tabsRegex = /<button \s*className=\{`\$\{styles\.tabBtn\} \$\{activeTab === 'users' \? styles\.tabActive : ''\}`\}\s*onClick=\{\(\) => setActiveTab\('users'\)\}\s*>\s*<Users size=\{16\} \/>\s*<span>User Management &amp; Ban Hammer<\/span>\s*<span className=\{styles\.countBadge\}>\{allUsers\.length\}<\/span>\s*<\/button>\s*<\/div>/;

if (tabsRegex.test(code)) {
  code = code.replace(
    tabsRegex,
    `<button 
            className={\`\${styles.tabBtn} \${activeTab === 'users' ? styles.tabActive : ''}\`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>User Management &amp; Ban Hammer</span>
            <span className={styles.countBadge}>{allUsers.length}</span>
          </button>
          <button 
            className={\`\${styles.tabBtn} \${activeTab === 'payouts' ? styles.tabActive : ''}\`}
            onClick={() => setActiveTab('payouts')}
          >
            <DollarSign size={16} />
            <span>Payout Requests</span>
            <span className={styles.countBadge} style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>{payoutRequests.filter(r => r.status === 'pending').length}</span>
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} style={{ color: '#10b981' }} /> Global Ad Pool Configuration
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Set the total distributable revenue for the current month. This amount will be split among creators based on their share of global platform ad views.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '250px' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
              <input 
                type="number"
                value={globalAdPoolAmount}
                onChange={(e) => setGlobalAdPoolAmount(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                placeholder="0.00"
              />
            </div>
            <button 
              className="btn-solid"
              onClick={handleSaveAdPool}
              disabled={isSavingAdPool}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {isSavingAdPool ? 'Saving...' : 'Update Pool'}
            </button>
          </div>
        </div>`
  );
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log('Fixed admin dashboard completely!');
