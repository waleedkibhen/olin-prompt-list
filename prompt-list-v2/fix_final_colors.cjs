const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// Fix revenue earned column text color
code = code.replace(
  "className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>",
  "className={styles.textRight} style={{ fontWeight: 600, color: 'var(--text-muted)' }}>"
);

// Fix Available Balance green color (regex to handle line breaks/spaces)
code = code.replace(
  /<span style=\{\{\s*fontWeight:\s*700,\s*color:\s*'#10b981'\s*\}\}>\$\{monetizationStats\.totalRevenue\.toFixed\(2\)\}<\/span>/g,
  `<span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>\$\\{monetizationStats.totalRevenue.toFixed(2)}</span>`
);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed colors");
