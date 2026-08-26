const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// Add imports
code = code.replace(/import \{ collection, onSnapshot, query, where, doc, deleteDoc, getDocs \} from 'firebase\/firestore';/, "import { collection, onSnapshot, query, where, doc, deleteDoc, getDocs, limit, orderBy, getAggregateFromServer, sum, count } from 'firebase/firestore';");

// 1. Add state for aggregated stats
const stateRegex = /const \[monetizationFilter, setMonetizationFilter\] = useState<'all' \| 'paid' \| 'ad'>\('all'\);/;
code = code.replace(stateRegex, "const [monetizationFilter, setMonetizationFilter] = useState<'all' | 'paid' | 'ad'>('all');\n  const [aggStats, setAggStats] = useState({ views: 0, likes: 0, saves: 0, copies: 0, totalPosts: 0 });");

// 2. Add an effect to fetch aggregated stats efficiently
const effectRegex = /const q = query\(collection\(db, "posts"\), where\("creatorId", "==", user\.uid\)\);/;
const replacementEffect = `
    const fetchAggregates = async () => {
      try {
        const aggQuery = query(collection(db, "posts"), where("creatorId", "==", user.uid));
        const snap = await getAggregateFromServer(aggQuery, {
          views: sum('viewsCount'),
          likes: sum('likesCount'),
          saves: sum('savesCount'),
          copies: sum('copiesCount'),
          totalPosts: count()
        });
        setAggStats({
          views: snap.data().views || 0,
          likes: snap.data().likes || 0,
          saves: snap.data().saves || 0,
          copies: snap.data().copies || 0,
          totalPosts: snap.data().totalPosts || 0
        });
      } catch (err) {
        console.error("Failed to fetch aggregate stats:", err);
      }
    };
    fetchAggregates();

    // Limit snapshot to avoid massive reads
    const q = query(collection(db, "posts"), where("creatorId", "==", user.uid), orderBy("createdAt", "desc"), limit(100));`;
code = code.replace(effectRegex, replacementEffect);

// 3. Update the displayed stats logic to use aggStats for "all"
const statsRegex = /const stats = React\.useMemo\(\(\) => \{[\s\S]*?\}, \[filteredPosts\]\);/;
const statsReplacement = `const stats = React.useMemo(() => {
    if (timeFilter === 'all') {
      return {
        views: aggStats.views,
        likes: aggStats.likes,
        saves: aggStats.saves,
        copies: aggStats.copies,
      };
    }
    return filteredPosts.reduce((acc, p) => ({
      views: acc.views + p.viewsCount,
      likes: acc.likes + p.likesCount,
      saves: acc.saves + p.savesCount,
      copies: acc.copies + (p.copiesCount || 0),
    }), { views: 0, likes: 0, saves: 0, copies: 0 });
  }, [filteredPosts, timeFilter, aggStats]);`;
code = code.replace(statsRegex, statsReplacement);

// 4. Update Monetization stats to use aggStats for userAdViews
const monRegex = /let userAdViews = 0;[\s\S]*?creatorPosts\.forEach\(p => \{/;
const monReplacement = `let userAdViews = aggStats.views;
    creatorPosts.forEach(p => {`;
code = code.replace(monRegex, monReplacement);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Updated CreatorDashboardPage to use getAggregateFromServer");
