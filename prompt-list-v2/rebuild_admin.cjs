const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

if (!code.includes('interface PayoutRequest')) {
  code = code.replace(
    /interface AdminPost extends Post \{[\s\S]*?\}/,
    `interface AdminPost extends Post {
  monetizationType?: 'ad' | 'charge' | 'free' | 'ad_supported';
}

interface PayoutRequest {
  id: string;
  userId: string;
  requestedAmount: number;
  payoutMethod: 'paypal' | 'crypto' | 'local_bank';
  payoutDetails: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}`
  );
}

if (!code.includes('const [payoutRequests, setPayoutRequests]')) {
  code = code.replace(
    'const [tickets, setTickets] = useState<Ticket[]>([]);',
    `const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);`
  );
}

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'flagged' \| 'monetization' \| 'tickets' \| 'users'>\('flagged'\);/,
  `const [activeTab, setActiveTab] = useState<'flagged' | 'monetization' | 'payouts' | 'tickets' | 'users'>('flagged');`
);

if (!code.includes('setPayoutRequests(')) {
  code = code.replace(
    /const ticketsSnapshot = await getDocs\(collection\(db, 'support_tickets'\)\);[\s\S]*?setTickets\(ticketsData\);/m,
    `const ticketsSnapshot = await getDocs(collection(db, 'support_tickets'));
      const ticketsData = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
      setTickets(ticketsData);

      const payoutsSnapshot = await getDocs(collection(db, 'payout_requests'));
      const payoutsData = payoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PayoutRequest));
      setPayoutRequests(payoutsData);`
  );
}

if (!code.includes('handleMarkPayoutPaid')) {
  code = code.replace(
    'const handleReplyTicket = async (ticket: Ticket) => {',
    `const handleMarkPayoutPaid = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'payout_requests', reqId), { status: 'completed' });
      setPayoutRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'completed' } : r));
      toast.success('Payout marked as completed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payout');
    }
  };
  
  const handleReplyTicket = async (ticket: Ticket) => {`
  );
}

code = code.replace(
  /const totalPlatformAdViews = allPosts\.reduce\(\(sum, p\) => sum \+ \(p\.viewsCount \|\| 0\), 0\);/g,
  `const totalPlatformAdViews = allPosts.filter(p => p.monetizationType === 'ad' || (p.monetizationType as any) === 'ad_supported').reduce((sum, p) => sum + (p.viewsCount || 0), 0);`
);

if (!code.includes('Payout Requests</span>')) {
  code = code.replace(
    /<button \n\s*className=\{\`\$\{styles\.tabBtn\} \$\{activeTab === 'tickets' \? styles\.tabActive : ''\}\`\}\n\s*onClick=\{\(\) => setActiveTab\('tickets'\)\}\n\s*>\n\s*<MessageSquare size=\{16\} \/>\n\s*<span>Support Tickets<\/span>\n\s*<span className=\{styles\.countBadge\}>\{tickets\.filter\(t => t\.status === 'open'\)\.length\}<\/span>\n\s*<\/button>/m,
    `<button 
            className={\`\${styles.tabBtn} \${activeTab === 'payouts' ? styles.tabActive : ''}\`}
            onClick={() => setActiveTab('payouts')}
          >
            <DollarSign size={16} />
            <span>Payout Requests</span>
            <span className={styles.countBadge}>{payoutRequests.filter(r => r.status === 'pending').length}</span>
          </button>
          <button 
            className={\`\${styles.tabBtn} \${activeTab === 'tickets' ? styles.tabActive : ''}\`}
            onClick={() => setActiveTab('tickets')}
          >
            <MessageSquare size={16} />
            <span>Support Tickets</span>
            <span className={styles.countBadge}>{tickets.filter(t => t.status === 'open').length}</span>
          </button>`
  );
}

if (!code.includes('activeTab === \'payouts\'')) {
  code = code.replace(
    /\{activeTab === 'tickets' && \(/,
    `{activeTab === 'payouts' && (
        <section className={styles.gridSection}>
          {payoutRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <DollarSign size={42} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3>No Payout Requests</h3>
              <p>There are no pending creator withdrawal requests.</p>
            </div>
          ) : (
            payoutRequests.map((req) => {
              const reqUser = allUsers.find(u => u.uid === req.userId);
              return (
                <div key={req.id} className={styles.card} style={req.status !== 'pending' ? { opacity: 0.7 } : {}}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{reqUser ? reqUser.displayName : 'Unknown User'}</h3>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      backgroundColor: req.status === 'pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: req.status === 'pending' ? '#f59e0b' : '#10b981'
                    }}>
                      {req.status.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.metaInfo}>
                    <span>Email: <strong>{reqUser?.email || 'N/A'}</strong></span>
                    <span>Amount: <strong style={{ color: '#10b981', fontSize: '1.1rem' }}>$\${req.requestedAmount.toFixed(2)}</strong></span>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4, marginTop: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>Method: {req.payoutMethod.replace('_', ' ')}</div>
                    <div>{req.payoutDetails}</div>
                  </div>
                  {req.status === 'pending' && (
                    <div className={styles.actionRow} style={{ marginTop: '1rem' }}>
                      <button type="button" className="btn-solid" onClick={() => handleMarkPayoutPaid(req.id)} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.4rem', alignItems: 'center' }}>
                        <Check size={16} /> Mark as Paid
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      {activeTab === 'tickets' && (`
  );
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log('Admin updated');
