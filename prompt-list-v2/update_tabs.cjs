const fs = require('fs');
let code = fs.readFileSync('src/components/DiscoveryFeed.tsx', 'utf8');

code = code.replace(
  /\{tab === 'for_you' \? 'For You' : tab === 'trending' \? 'Trending' : tab === 'newest' \? 'Newest' : tab === 'following' \? 'Following' : 'Saved'\}/,
  "{tab === 'for_you' ? 'for you' : tab === 'trending' ? 'trending' : tab === 'newest' ? 'newest' : tab === 'following' ? 'following' : 'saved'}"
);

fs.writeFileSync('src/components/DiscoveryFeed.tsx', code);
console.log("Updated tabs in DiscoveryFeed.tsx");
