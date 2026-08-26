const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const regex = /const displayMonetizationPosts = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[monetizationPosts, monetizationFilter\]\);/;

const replacement = `const displayMonetizationPosts = React.useMemo(() => {
    // All posts are monetized via global ad revenue now
    return creatorPosts;
  }, [creatorPosts]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated displayMonetizationPosts");
