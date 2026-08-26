const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const oldStatsRegex = /const monetizationStats = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[monetizationPosts\]\);/;
if (oldStatsRegex.test(code)) {
  code = code.replace(oldStatsRegex, `const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;
    let userAdViews = 0;

    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (p.monetizationType === 'ad' || p.monetizationType === 'ad_supported') {
        userAdViews += (p.viewsCount || 0);
        adPosts++;
      }
    });
    
    const adRevenue = totalPlatformAdViews > 0 ? (userAdViews / totalPlatformAdViews) * (globalAdPool.distributablePool || 0) : 0;
    const isAdRevenuePending = userAdViews < 1000;

    return { 
      totalRevenue: paidRevenue + (!isAdRevenuePending ? adRevenue : 0), 
      paidRevenue, 
      adRevenue: !isAdRevenuePending ? adRevenue : 0,
      paidUnlocks, 
      adUnlocks: userAdViews,
      paidPosts,
      adPosts,
      adViews: userAdViews,
      isAdRevenuePending
    };
  }, [monetizationPosts, totalPlatformAdViews, globalAdPool]);`);
}

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed stats for real!');
