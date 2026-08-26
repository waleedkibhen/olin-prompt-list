const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const regex = /const monetizationStats = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[monetizationPosts, totalPlatformAdViews, globalAdPool\]\);/;

const replacement = `const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;

    // We loop through the recent fetched posts to calculate paid revenue.
    // For a robust system with thousands of paid posts, this should query a 'payments' collection.
    creatorPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : p.monetizationType;
      if (mType === 'charge' || mType === 'subscribers_only') {
        const price = parseFloat(p.price?.toString() || '0');
        paidRevenue += (p.copiesCount || 0) * price * 0.85; // assuming 15% platform fee
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      }
    });

    // ALL posts now earn ad revenue! We use the efficient server aggregate sum:
    const userAdViews = aggStats.views;
    const adPosts = aggStats.totalPosts; // All posts are ad-supported
    
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
  }, [creatorPosts, aggStats, totalPlatformAdViews, globalAdPool]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated monetizationStats to use aggStats for ad views");
