const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// Replace the monetization metrics logic
const regex = /const monetizationPosts = creatorPosts\.filter.*?\]\);/s;

const replacement = `const monetizationPosts = creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'subscribers_only' || (p.monetizationType as any) === 'ad_supported' || (p.monetizationType as any) === 'ad' || p.monetizationType === 'free' || !p.monetizationType);

  const metrics = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;
    let userAdViews = 0;

    // Now everybody gets ad revenue based on ALL their post views
    creatorPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : (p.monetizationType || 'free');
      
      // Calculate Paid Revenue
      if (mType === 'charge' || mType === 'subscribers_only') {
        const price = parseFloat(p.price?.toString() || '0');
        paidRevenue += (p.copiesCount || 0) * price * 0.85;
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      }
      
      // All posts count towards ad views since ads run on every post
      userAdViews += (p.viewsCount || 0);
    });
    
    // Legacy support for metric display
    adPosts = creatorPosts.length;
    
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
  }, [creatorPosts, totalPlatformAdViews, globalAdPool]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated metrics calculation");
