const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

const importRegex = /import React, \{ useState, useEffect \} from 'react';/;
code = code.replace(importRegex, "import React, { useState, useEffect } from 'react';\nimport { getAggregateFromServer, sum } from 'firebase/firestore';");

const insertRegex = /<button \r?\n\s*className="btn-solid"\r?\n\s*onClick=\{handleSaveAdPool\}[\s\S]*?<\/button>/;

const btnHtml = `
              <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-solid"
                onClick={handleSaveAdPool}
                disabled={isSavingAdPool}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSavingAdPool ? 'Saving...' : 'Update Pool'}
              </button>

              <button 
                className="btn-solid"
                style={{ backgroundColor: '#10b981', display: 'flex', alignItems: 'center' }}
                onClick={async () => {
                  if(!window.confirm("Recalculate global pool views using ALL post views? (Costs 1 aggregate read)")) return;
                  try {
                    const { collection, doc, updateDoc } = await import('firebase/firestore');
                    const agg = await getAggregateFromServer(collection(db, 'posts'), { totalViews: sum('viewsCount') });
                    const total = agg.data().totalViews;
                    await updateDoc(doc(db, 'system', 'adPool'), { totalPlatformAdViews: total });
                    alert("Updated global pool views to: " + total);
                  } catch(e) {
                    console.error(e);
                    alert("Error: " + e.message);
                  }
                }}
              >
                Recalculate Global Views
              </button>
              </div>
`;

code = code.replace(insertRegex, btnHtml);
fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added recalculate button to AdminDashboardPage");
