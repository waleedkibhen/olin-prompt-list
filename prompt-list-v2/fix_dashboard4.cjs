
const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

code = code.replace(/const revenue = isPaid[\\s\\S]*?: \\(unlocks \\* 0\\.12\\)\\.toFixed\\(2\\);/, 'const revenue = isPaid ? (unlocks * (post.price || 1.99)).toFixed(2) : null;');
code = code.replace(/<td className=\\{styles\\.textRight\\} style=\\{\\{ fontWeight: 600, color: '#10b981' \\}\\}>[\\s\\S]*?<\\/td>/, '<td className={styles.textRight} style={{ fontWeight: 600, color: \\'#10b981\\' }}>{revenue !== null ? ${revenue} : \\'-\\'}</td>');

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed dashboard bug');

