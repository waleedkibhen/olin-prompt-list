const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const regexPaid = /<span className=\{styles\.badgePill\} style=\{\{ backgroundColor: 'rgba\(59, 130, 246, 0\.1\)', color: '#3b82f6', border: '1px solid rgba\(59, 130, 246, 0\.2\)', display: 'inline-flex', alignItems: 'center', gap: '0\.25rem' \}\}>\s*<Lock size=\{12\} \/> Paid \(\$\{post\.price\?\.toFixed\(2\) \|\| '1\.99'\}\)\s*<\/span>/;
const newPaid = `<span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                                  Paid (\\$\\{post.price?.toFixed(2) || '1.99'\\})
                                </span>`;

const regexAd = /<span className=\{styles\.badgePill\} style=\{\{ backgroundColor: 'rgba\(139, 92, 246, 0\.1\)', color: '#8b5cf6', border: '1px solid rgba\(139, 92, 246, 0\.2\)', display: 'inline-flex', alignItems: 'center', gap: '0\.25rem' \}\}>\s*<PlayCircle size=\{12\} \/> Ad Unlock\s*<\/span>/;
const newAd = `<span className={styles.badgePill} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', border: 'none', padding: 0 }}>
                                  Ad Unlock
                                </span>`;

code = code.replace(regexPaid, newPaid);
code = code.replace(regexAd, newAd);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated badges with regex");
