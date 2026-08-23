const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const target1 = `const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : (unlocks * 0.12).toFixed(2);`;

const rep1 = `const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : null;`;

code = code.replace(target1, rep1);

const target2 = `<td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>
                              $\\${revenue}
                            </td>`;

const rep2 = `<td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>
                              {revenue !== null ? \`$\${revenue}\` : '-'}
                            </td>`;

code = code.replace(target2, rep2);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed dashboard bug');
