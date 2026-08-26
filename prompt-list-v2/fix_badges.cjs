const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const oldPaid = `<span className={styles.badgePill} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Lock size={12} /> Paid (\\$\\{post.price?.toFixed(2) || '1.99'\\})
                                </span>`;
const newPaid = `<span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                                  Paid (\\$\\{post.price?.toFixed(2) || '1.99'\\})
                                </span>`;

const oldAd = `<span className={styles.badgePill} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <PlayCircle size={12} /> Ad Unlock
                                </span>`;
const newAd = `<span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                                  Ad Unlock
                                </span>`;

code = code.replace(oldPaid, newPaid);
code = code.replace(oldAd, newAd);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated badges");
