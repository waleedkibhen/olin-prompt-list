const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const derivedArrayStr = `  const monetizationPosts = React.useMemo(() => {
    return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported');
  }, [creatorPosts]);`;

if (!code.includes('const monetizationPosts =')) {
    code = code.replace(
        /const filteredPosts = React\.useMemo/g,
        derivedArrayStr + '\n\n  const filteredPosts = React.useMemo'
    );
    fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
    console.log('Added monetizationPosts derived array');
}
