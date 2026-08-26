const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

if (!code.includes('DollarSign')) {
  code = code.replace(/Loader2, Sparkles \} from 'lucide-react';/, `Loader2, Sparkles, DollarSign } from 'lucide-react';`);
  fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
  console.log("Added DollarSign to lucide-react imports");
} else {
  // Find the line containing DollarSign
  const lines = code.split('\n');
  const idx = lines.findIndex(l => l.includes('DollarSign'));
  console.log("DollarSign found on line " + (idx + 1) + ": " + lines[idx]);
}
