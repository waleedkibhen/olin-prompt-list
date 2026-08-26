const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

if (!code.includes('interface PayoutRequest')) {
  code = code.replace(
    'interface AdminPost {',
    `interface PayoutRequest {
  id: string;
  userId: string;
  requestedAmount: number;
  payoutMethod: 'paypal' | 'crypto' | 'local_bank';
  payoutDetails: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

interface AdminPost {`
  );
}

if (!code.includes('DollarSign')) {
  code = code.replace(
    'MessageSquare',
    'MessageSquare, DollarSign'
  );
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log('Fixed');
