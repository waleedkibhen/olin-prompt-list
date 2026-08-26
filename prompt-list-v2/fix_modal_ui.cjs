const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. Change Award icon color
code = code.replace(
  "<Award size={20} style={{ color: '#10b981' }} />",
  "<Award size={20} style={{ color: 'var(--text-muted)' }} />"
);

// 2. Change Available Balance color
code = code.replace(
  "<span style={{ fontWeight: 700, color: '#10b981' }}>\\${monetizationStats.totalRevenue.toFixed(2)}</span>",
  "<span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>\\${monetizationStats.totalRevenue.toFixed(2)}</span>"
);

// Optional: just in case the options need explicit style too for browsers that ignore color-scheme for options:
const oldSelect = `<option value="paypal">PayPal</option>
                      <option value="crypto">Crypto (USDT - TRC20/Solana)</option>
                      <option value="local_bank">Local Bank Transfer (via Wise)</option>`;
const newSelect = `<option value="paypal" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>PayPal</option>
                      <option value="crypto" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Crypto (USDT - TRC20/Solana)</option>
                      <option value="local_bank" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Local Bank Transfer (via Wise)</option>`;

code = code.replace(oldSelect, newSelect);

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log("Fixed dashboard modal UI");
