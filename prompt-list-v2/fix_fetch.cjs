const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const target1 = `    const adPoolUnsub = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalAdPool(docSnap.data() as any);
      }
    });
    
    const allPostsUnsub = onSnapshot(collection(db, 'posts'), (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(d => {
        const p = d.data();
        if (p.monetizationType === 'ad_supported') {
          total += (p.viewsCount || 0);
        }
      });
      setTotalPlatformAdViews(total);
    });`;

const replace1 = `    const adPoolUnsub = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGlobalAdPool(data as any);
        setTotalPlatformAdViews(data.totalPlatformAdViews || 0);
      }
    });`;

code = code.replace(target1, replace1);

const targetUnsub = `return () => { unsubscribe(); adPoolUnsub(); allPostsUnsub(); };`;
const replaceUnsub = `return () => { unsubscribe(); adPoolUnsub(); };`;
code = code.replace(targetUnsub, replaceUnsub);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed fetching logic in CreatorDashboardPage");
