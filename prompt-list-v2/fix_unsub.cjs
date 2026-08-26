const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

if (!code.includes('unsubAdPool')) {
  code = code.replace(
    `const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {`,
    `const unsubAdPool = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
        if (docSnap.exists()) {
          setGlobalAdPoolAmount(docSnap.data().distributablePool?.toString() || '0');
        }
      });
      
      const unsubPosts = onSnapshot(collection(db, 'posts'), (snapshot) => {`
  );
  
  code = code.replace(
    /return \(\) => \{\s*unsubPosts\(\);\s*unsubUsers\(\);\s*unsubTickets\(\);\s*unsubReqs\(\);\s*unsubPayouts\(\);\s*\};/,
    'return () => { unsubPosts(); unsubUsers(); unsubTickets(); unsubReqs(); unsubPayouts(); unsubAdPool(); };'
  );
  
  fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
  console.log("Added unsubAdPool");
}
