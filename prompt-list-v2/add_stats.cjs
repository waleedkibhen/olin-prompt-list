const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const monStatsStr = `  const monetizationStats = React.useMemo(() => {
    let revenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        // Mock revenue logic
        revenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
      } else if (p.monetizationType === 'ad_supported') {
        revenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
      }
    });
    return { revenue, paidUnlocks, adUnlocks };
  }, [monetizationPosts]);`;

if (!code.includes('const monetizationStats =')) {
    code = code.replace(
        /const handleDeletePost =/g,
        monStatsStr + '\n\n  const handleDeletePost ='
    );
    fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
    console.log('Added monetizationStats');
}
