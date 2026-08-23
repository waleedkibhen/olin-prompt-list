const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const target1 = `const revenue = isPaid \n                          ? (unlocks * (post.price || 1.99)).toFixed(2) \n                          : (unlocks * 0.12).toFixed(2);`;

const rep1 = `const revenue = isPaid \n                          ? (unlocks * (post.price || 1.99)).toFixed(2) \n                          : null;`;

code = code.replace(target1, rep1);

const target2 = `<td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>\n                              $\\${revenue}\n                            </td>`;

const rep2 = `<td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>\n                              {revenue !== null ? \`$\\${revenue}\` : '-'}\n                            </td>`;

// Let's just use regex again but simpler
code = code.replace(/const revenue = isPaid[\s\S]*?: \(unlocks \* 0\.12\)\.toFixed\(2\);/, `const revenue = isPaid ? (unlocks * (post.price || 1.99)).toFixed(2) : null;`);
code = code.replace(/<td className=\{styles\.textRight\} style=\{\{ fontWeight: 600, color: '#10b981' \}\}>\s*\$\\\$\{revenue\}\s*<\/td>/, `<td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>{revenue !== null ? \`$\${revenue}\` : '-'}</td>`);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed dashboard bug');
