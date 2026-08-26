const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// Strip out aggStats
code = code.replace(/const \[aggStats, setAggStats\] = useState\(\{ views: 0, likes: 0, saves: 0, copies: 0, totalPosts: 0 \}\);\r?\n/, "");

// Strip out fetchAggregates
code = code.replace(/const fetchAggregates = async \(\) => \{[\s\S]*?fetchAggregates\(\);\r?\n/, "");

// Remove limit(250) from snapshot query
code = code.replace(/const q = query\(collection\(db, "posts"\), where\("creatorId", "==", user\.uid\), orderBy\("createdAt", "desc"\), limit\(250\)\);/, `const q = query(collection(db, "posts"), where("creatorId", "==", user.uid));`);

// Revert stats to not use aggStats
code = code.replace(/const stats = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[filteredPosts, timeFilter, aggStats\]\);/, `const stats = React.useMemo(() => {
    return filteredPosts.reduce((acc, p) => ({
      views: acc.views + (p.viewsCount || 0),
      likes: acc.likes + (p.likesCount || 0),
      saves: acc.saves + (p.savesCount || 0),
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [filteredPosts]);`);

// Revert monetizationStats
code = code.replace(/const monetizationStats = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[creatorPosts, aggStats, totalPlatformAdViews, globalAdPool\]\);/, `const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = creatorPosts.length;
    let userAdViews = 0;

    creatorPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : p.monetizationType;
      if (mType === 'charge' || mType === 'subscribers_only') {
        const price = parseFloat(p.price?.toString() || '0');
        paidRevenue += (p.copiesCount || 0) * price * 0.85; // assuming 15% platform fee
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      }
      userAdViews += (p.viewsCount || 0);
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
  }, [creatorPosts, totalPlatformAdViews, globalAdPool]);`);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Reverted dashboard stats to use local sum of fetched posts");
