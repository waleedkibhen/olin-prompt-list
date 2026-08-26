const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. Total Revenue icon
code = code.replace(
  "<Sparkles size={18} className={styles.kpiIcon} style={{color: '#10b981'}} />",
  "<DollarSign size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />"
);

// 2. Paid Posts icon
code = code.replace(
  "<Lock size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />",
  "<Lock size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />"
);

// 3. Paid Revenue icon
code = code.replace(
  "<DollarSign size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />",
  "<DollarSign size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />"
);

// 4. Ad Posts icon
code = code.replace(
  "<MonitorPlay size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />",
  "<MonitorPlay size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />"
);

// 5. Ad Revenue icon
code = code.replace(
  "<Eye size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />",
  "<Eye size={18} className={styles.kpiIcon} style={{color: 'var(--text-muted)'}} />"
);

// 6. Ad Revenue Pending Text
code = code.replace(
  "Your ad earnings will appear once you reach a total of 1,000 views across all your posts (Current: {monetizationStats.adViews.toLocaleString()}).",
  "Your ad earnings will appear once you reach a total of 1,000 views. Current views: {monetizationStats.adViews.toLocaleString()}"
);

// 7. Request Payout button styling
const buttonStr = "style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600 }}";
const newButtonStr = "style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', fontWeight: 600, background: '#3b82f6', color: '#fff', border: 'none' }}";
code = code.replace(buttonStr, newButtonStr);

// 8. Info Modal icons and titles
code = code.replace(
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>",
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>"
);
code = code.replace(
  "<Lock size={16} />",
  "<Lock size={16} style={{ color: 'var(--text-muted)' }} />"
);

code = code.replace(
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>",
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>"
);
code = code.replace(
  "<PlayCircle size={16} />",
  "<PlayCircle size={16} style={{ color: 'var(--text-muted)' }} />"
);

code = code.replace(
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>\n                    <DollarSign size={16} />",
  "<h4 style={{ margin: '0 0 0.5rem 0', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>\n                    <DollarSign size={16} style={{ color: 'var(--text-muted)' }} />"
);

code = code.replace(
  "<Info size={20} style={{ color: '#3b82f6' }} />",
  "<Info size={20} style={{ color: 'var(--text-muted)' }} />"
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed UI in CreatorDashboardPage.tsx');
