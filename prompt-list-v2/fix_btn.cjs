const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const target = `              <div style={{ marginBottom: '2rem' }}>
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
              }`;

code = code.replace(
  target,
  `              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
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

// Wait, the user said "And then we have these made-up numbers that were never supposed to exist."
// What does he mean by made-up numbers? 
// The screenshot shows $1.20 estimated overall earnings, $1.20 estimated monthly pool share.
// Maybe he means the Total Platform Ad Views that I added in the admin panel? No, he's talking about the Creator Dashboard.

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed button');
