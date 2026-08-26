const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

code = code.replace(
  'MessageSquare, Flame, Ban, CheckCircle, ShieldCheck, Send, \nLoader2, Sparkles } from \'lucide-react\';',
  'MessageSquare, DollarSign, Flame, Ban, CheckCircle, ShieldCheck, Send, \nLoader2, Sparkles } from \'lucide-react\';'
);

code = code.replace(
  /} from 'lucide-react';/,
  ', DollarSign } from \'lucide-react\';'
);

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log('Fixed');
