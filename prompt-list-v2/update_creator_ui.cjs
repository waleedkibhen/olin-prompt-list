const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const bannerTarget = `{showMonetizationInfo && (`;
const bannerReplace = `{monetizationStats.isAdRevenuePending && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <div style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.25rem' }}>
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Ad Revenue Pending</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Your ad earnings will appear once you reach <strong>1,000 ad impressions</strong> (Current: {monetizationStats.adViews.toLocaleString()}) and the platform's monthly Adsterra pool is distributed.
                    </p>
                  </div>
                </div>
              )}

              {showMonetizationInfo && (`;

code = code.replace(bannerTarget, bannerReplace);

const uiTargetAdRev = `<div className={styles.kpiValue}>$\${monetizationStats.adRevenue.toFixed(2)}</div>`;
const uiReplaceAdRev = `<div className={styles.kpiValue}>{monetizationStats.isAdRevenuePending ? '-' : \`$\${monetizationStats.adRevenue.toFixed(2)}\`}</div>`;
code = code.replace(uiTargetAdRev, uiReplaceAdRev);

// Replace adUnlocks with adViews in the table if it's there
const tableTarget = `const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : null;`;
const tableReplace = `const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        const mType = (post.monetizationType as any) === 'ad' ? 'ad_supported' : post.monetizationType;
                        const isPaidLocal = mType === 'charge';
                        
                        let revenue = null;
                        if (isPaidLocal) {
                          revenue = (unlocks * (post.price || 1.99)).toFixed(2);
                        } else if (mType === 'ad_supported' && !monetizationStats.isAdRevenuePending && globalAdPool.totalPlatformAdViews > 0) {
                          const pool = globalAdPool.totalBalance || 0;
                          const feePercent = pool < 1000 ? 0.20 : 0.30;
                          const distributablePool = pool * (1 - feePercent);
                          revenue = ((unlocks / globalAdPool.totalPlatformAdViews) * distributablePool).toFixed(2);
                        }`;
code = code.replace(tableTarget, tableReplace);


fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated UI for Ad Revenue");
