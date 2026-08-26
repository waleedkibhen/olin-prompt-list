const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

const importRegex = /import React, \{ useState, useEffect \} from 'react';/;
code = code.replace(importRegex, "import React, { useState, useEffect } from 'react';\nimport { getAggregateFromServer, sum } from 'firebase/firestore';");

const btnHtml = `
          <button 
            onClick={async () => {
              if(!window.confirm("Recalculate global pool views using ALL post views? (Costs 1 aggregate read)")) return;
              try {
                const agg = await getAggregateFromServer(collection(db, 'posts'), { totalViews: sum('viewsCount') });
                const total = agg.data().totalViews;
                await updateDoc(doc(db, 'system', 'adPool'), { totalPlatformAdViews: total });
                alert("Updated global pool views to: " + total);
              } catch(e) {
                console.error(e);
                alert("Error: " + e.message);
              }
            }}
            className={styles.payoutButton} style={{ backgroundColor: '#10b981', marginLeft: '1rem' }}
          >
            Recalculate Global Views
          </button>
`;

const insertRegex = /<button \r?\n\s*className=\{styles\.payoutButton\}\r?\n\s*onClick=\{handleTopUp\}\r?\n\s*disabled=\{isUpdatingPool\}\r?\n\s*>\r?\n\s*\{isUpdatingPool \? \(\r?\n\s*<>\r?\n\s*<Loader2 size=\{18\} className=\{styles\.spinner\} \/>\r?\n\s*Adding\.\.\.\r?\n\s*<\/>\r?\n\s*\) : \(\r?\n\s*<>\r?\n\s*<PlusCircle size=\{18\} \/>\r?\n\s*Top Up Pool\r?\n\s*<\/>\r?\n\s*\)\}\r?\n\s*<\/button>/;

code = code.replace(insertRegex, "$&" + btnHtml);
fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added recalculate button");
