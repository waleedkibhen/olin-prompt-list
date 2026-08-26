const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

code = code.replace(/import \{ ShieldAlert, Check, X, AlertTriangle, Users, MessageSquare, Flame, Ban, CheckCircle, ShieldCheck, Send, Loader2, Sparkles \} from 'lucide-react';/,
`import { ShieldAlert, Check, X, AlertTriangle, Users, MessageSquare, Flame, Ban, CheckCircle, ShieldCheck, Send, Loader2, Sparkles, DollarSign } from 'lucide-react';`);

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added DollarSign to lucide-react imports");
