const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

code = code.replace(
  'const [tickets, setTickets] = useState<SupportTicket[]>([]);',
  `const [tickets, setTickets] = useState<SupportTicket[]>([]);\n  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);`
);

code = code.replace(
  'const handleReplyTicket = async (ticket: SupportTicket) => {',
  `const handleMarkPayoutPaid = async (reqId: string) => {
    try {
      await updateDoc(doc(db, 'payout_requests', reqId), { status: 'completed' });
      setPayoutRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'completed' } : r));
      toast.success('Payout marked as completed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update payout');
    }
  };
  
  const handleReplyTicket = async (ticket: SupportTicket) => {`
);

if (!code.includes('import {') || !code.includes('DollarSign')) {
  code = code.replace(
    'MessageSquare',
    'MessageSquare, DollarSign'
  );
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log('Fixed');
