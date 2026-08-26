const fs = require('fs');
let code = fs.readFileSync('src/pages/AdTestPage.tsx', 'utf8');

const regex = /export default function AdTestPage\(\) \{/;
const replacement = `import { getAggregateFromServer, sum, count, collection, query, where, getFirestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdTestPage() {
  const [err, setErr] = React.useState('');
  const [res, setRes] = React.useState('');
  
  React.useEffect(() => {
    async function testAgg() {
      try {
        const aggQuery = query(collection(db, "posts")); // just a simple one
        const snap = await getAggregateFromServer(aggQuery, {
          views: sum('viewsCount'),
          totalPosts: count()
        });
        setRes(JSON.stringify(snap.data()));
      } catch (e: any) {
        setErr(e.toString());
      }
    }
    testAgg();
  }, []);

  return <div><h1>Test</h1><p>Res: {res}</p><p>Err: {err}</p></div>;
}
// `;

// I'll just write a quick node script using tsx to fetch it!
