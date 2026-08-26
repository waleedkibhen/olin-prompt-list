const fs = require('fs');

const creatorDash = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const promptCard = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

console.log("--- ISSUES VERIFICATION ---");

// Check 1: onSnapshot for all posts in CreatorDashboard
const hasAllPostsSnapshot = creatorDash.includes("onSnapshot(collection(db, 'posts')") && creatorDash.includes("setTotalPlatformAdViews(total)");
console.log("Issue 1 (All Posts Snapshot in CreatorDash):", hasAllPostsSnapshot ? "EXISTS" : "DOES NOT EXIST");

// Check 2: Legacy 'ad' normalization missing
// Look at the memo loop for monetizationStats
const hasAdSupportedOnly = creatorDash.includes("else if (p.monetizationType === 'ad_supported') {") && !creatorDash.includes("const mType = ");
console.log("Issue 2 (Legacy 'ad' ignored):", hasAdSupportedOnly ? "EXISTS" : "DOES NOT EXIST");

// Check 3: Table Revenue Display broken
const hasNullRevenue = creatorDash.includes("const revenue = isPaid \r\n                          ? (unlocks * (post.price || 1.99)).toFixed(2) \r\n                          : null;") || creatorDash.includes("const revenue = isPaid \n                          ? (unlocks * (post.price || 1.99)).toFixed(2) \n                          : null;");
console.log("Issue 3 (Table Revenue hardcoded to null for ads):", creatorDash.includes("? (unlocks * (post.price || 1.99)).toFixed(2)") ? "EXISTS (Snippet found)" : "DOES NOT EXIST");

// Check 4: Global adPool increment missing in PromptCard
const hasGlobalIncrement = promptCard.includes("doc(db, 'system', 'adPool')") && promptCard.includes("totalPlatformAdViews: increment(1)");
console.log("Issue 4 (Global increment missing in PromptCard):", !hasGlobalIncrement ? "EXISTS" : "DOES NOT EXIST");

