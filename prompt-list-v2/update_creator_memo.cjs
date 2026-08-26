const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const targetMemo = `const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let adRevenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;

    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (p.monetizationType === 'ad_supported') {
        adRevenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
        adPosts++;
      }
    });
    return { 
      totalRevenue: paidRevenue + adRevenue, 
      paidRevenue, 
      adRevenue,
      paidUnlocks, 
      adUnlocks,
      paidPosts,
      adPosts
    };
  }, [monetizationPosts]);`;

const replaceMemo = `const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    
    let adViews = 0;
    let adPosts = 0;

    monetizationPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : p.monetizationType;
      
      if (mType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (mType === 'ad_supported') {
        adViews += (p.viewsCount || 0);
        adPosts++;
      }
    });

    const pool = globalAdPool.totalBalance || 0;
    const feePercent = pool < 1000 ? 0.20 : 0.30;
    const distributablePool = pool * (1 - feePercent);
    const platformViews = globalAdPool.totalPlatformAdViews || 0;
    
    let adRevenue = 0;
    let isAdRevenuePending = true;

    if (adViews >= 1000 && platformViews > 0 && distributablePool > 0) {
      adRevenue = (adViews / platformViews) * distributablePool;
      isAdRevenuePending = false;
    }

    return { 
      totalRevenue: paidRevenue + adRevenue, 
      paidRevenue, 
      adRevenue,
      isAdRevenuePending,
      paidUnlocks, 
      adViews,
      paidPosts,
      adPosts
    };
  }, [monetizationPosts, globalAdPool]);`;

code = code.replace(targetMemo, replaceMemo);

// Ensure the first creatorPosts filter covers 'ad' too
const filterTarget = `return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported');`;
const filterReplace = `return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported' || (p.monetizationType as any) === 'ad');`;
code = code.replace(filterTarget, filterReplace);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated monetizationStats calculation");
