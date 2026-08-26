const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const targetMemo = `  const monetizationStats = React.useMemo(() => {
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
      } else if (p.monetizationType === 'ad_supported') {
        userAdViews += (p.viewsCount || 0);
        adPosts++;
      }
    });`;

const replaceMemo = `  const monetizationStats = React.useMemo(() => {
    let paidRevenue = 0;
    let paidUnlocks = 0;
    let paidPosts = 0;
    let adPosts = 0;
    let userAdViews = 0;

    monetizationPosts.forEach(p => {
      const mType = (p.monetizationType as any) === 'ad' ? 'ad_supported' : p.monetizationType;
      
      if (mType === 'charge') {
        paidRevenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
        paidPosts++;
      } else if (mType === 'ad_supported') {
        userAdViews += (p.viewsCount || 0);
        adPosts++;
      }
    });`;

code = code.replace(targetMemo, replaceMemo);

// Don't forget to update displayMonetizationPosts filter to also catch legacy 'ad'
const filterTarget = `if (monetizationFilter === 'ad') return monetizationPosts.filter(p => p.monetizationType === 'ad_supported');`;
const filterReplace = `if (monetizationFilter === 'ad') return monetizationPosts.filter(p => p.monetizationType === 'ad_supported' || (p.monetizationType as any) === 'ad');`;
code = code.replace(filterTarget, filterReplace);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed memo logic in CreatorDashboardPage");
