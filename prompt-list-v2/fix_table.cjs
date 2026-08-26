const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const targetTableMath = `                      {displayMonetizationPosts.map(post => {
                        const isPaid = post.monetizationType === 'charge';
                        const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : null;`;

const replaceTableMath = `                      {displayMonetizationPosts.map(post => {
                        const mType = (post.monetizationType as any) === 'ad' ? 'ad_supported' : post.monetizationType;
                        const isPaidLocal = mType === 'charge';
                        const unlocks = isPaidLocal ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        
                        let revenue = null;
                        if (isPaidLocal) {
                          revenue = (unlocks * (post.price || 1.99)).toFixed(2);
                        } else if (mType === 'ad_supported' && !monetizationStats.isAdRevenuePending && totalPlatformAdViews > 0) {
                          const pool = globalAdPool.distributablePool || 0;
                          revenue = ((unlocks / totalPlatformAdViews) * pool).toFixed(2);
                        }`;

code = code.replace(targetTableMath, replaceTableMath);

// Wait, the UI check uses `isPaid` but I renamed it to `isPaidLocal`. Let's just keep `isPaid` for safety.
const targetTableMathSafe = `                      {displayMonetizationPosts.map(post => {
                        const isPaid = post.monetizationType === 'charge';
                        const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : null;`;

const replaceTableMathSafe = `                      {displayMonetizationPosts.map(post => {
                        const mType = (post.monetizationType as any) === 'ad' ? 'ad_supported' : post.monetizationType;
                        const isPaid = mType === 'charge';
                        const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        
                        let revenue = null;
                        if (isPaid) {
                          revenue = (unlocks * (post.price || 1.99)).toFixed(2);
                        } else if (mType === 'ad_supported' && !monetizationStats.isAdRevenuePending && totalPlatformAdViews > 0) {
                          const pool = globalAdPool.distributablePool || 0;
                          revenue = ((unlocks / totalPlatformAdViews) * pool).toFixed(2);
                        }`;

// Wait, I already ran a string replacement test in my head, I should replace it with the safe one.
code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8'); // reload
code = code.replace(targetTableMathSafe, replaceTableMathSafe);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed table math in CreatorDashboardPage");
