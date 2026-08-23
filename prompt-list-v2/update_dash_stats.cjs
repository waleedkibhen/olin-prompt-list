const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. Add states
if (!code.includes('monetizationFilter')) {
    code = code.replace(
        /const \[activeTab, setActiveTab\] = useState<'performance' \| 'monetization'>\('performance'\);/g,
        "const [activeTab, setActiveTab] = useState<'performance' | 'monetization'>('performance');\n  const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'paid' | 'ad'>('all');\n  const [showMonetizationInfo, setShowMonetizationInfo] = useState(true);"
    );
}

// 2. Update monetizationStats
const oldStatsStr = `  const monetizationStats = React.useMemo(() => {
    let revenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        revenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
      } else if (p.monetizationType === 'ad_supported') {
        revenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
      }
    });
    return { revenue, paidUnlocks, adUnlocks };
  }, [monetizationPosts]);`;

const newStatsStr = `  const monetizationStats = React.useMemo(() => {
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
  }, [monetizationPosts]);

  const displayMonetizationPosts = React.useMemo(() => {
    if (monetizationFilter === 'all') return monetizationPosts;
    if (monetizationFilter === 'paid') return monetizationPosts.filter(p => p.monetizationType === 'charge');
    if (monetizationFilter === 'ad') return monetizationPosts.filter(p => p.monetizationType === 'ad_supported');
    return monetizationPosts;
  }, [monetizationPosts, monetizationFilter]);
`;

code = code.replace(oldStatsStr, newStatsStr);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Updated state and stats');
