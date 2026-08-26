const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const stateTarget = `const [followerCount, setFollowerCount] = useState(0);`;
const stateReplacement = `const [followerCount, setFollowerCount] = useState(0);
  const [globalAdPool, setGlobalAdPool] = useState<{ totalBalance: number, totalPlatformAdViews: number }>({ totalBalance: 0, totalPlatformAdViews: 0 });`;

code = code.replace(stateTarget, stateReplacement);

const fetchTarget = `const q = query(
        collection(db, 'posts'),
        where('creator.uid', '==', user.uid)
      );`;
const fetchReplacement = `// Fetch global ad pool stats
      const unsubAdPool = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
        if (docSnap.exists()) {
          setGlobalAdPool(docSnap.data() as { totalBalance: number, totalPlatformAdViews: number });
        }
      });

      const q = query(
        collection(db, 'posts'),
        where('creator.uid', '==', user.uid)
      );`;

code = code.replace(fetchTarget, fetchReplacement);

const cleanupTarget = `return () => {
        unsubPosts();
      };`;
const cleanupReplacement = `return () => {
        unsubPosts();
        unsubAdPool();
      };`;

code = code.replace(cleanupTarget, cleanupReplacement);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Added Ad Pool fetch to Creator Dashboard");
