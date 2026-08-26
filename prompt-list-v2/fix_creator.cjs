const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const targetBanner = `<p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Your ad earnings will appear once you reach <strong>1,000 ad impressions</strong> (Current: {monetizationStats.adViews.toLocaleString()}) and the platform's monthly Adsterra pool is distributed.
                    </p>`;

const replaceBanner = `<p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      Your ad earnings will appear once you reach a total of 1,000 views across all your posts (Current: {monetizationStats.adViews.toLocaleString()}).
                    </p>`;

code = code.replace(targetBanner, replaceBanner);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed banner in CreatorDashboardPage');
