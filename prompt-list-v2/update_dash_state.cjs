const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// Update data fetching
code = code.replace(
    /isPaid: d\.isPaid \|\| false,\s*price: d\.price \|\| 0,/g,
    "isPaid: d.isPaid || false,\n          price: d.price || 0,\n          monetizationType: d.monetizationType || (d.isPaid ? 'charge' : 'free'),"
);

// Add state for tabs
if (!code.includes('const [activeTab, setActiveTab]')) {
    code = code.replace(
        /const \[timeFilter, setTimeFilter\] = useState\('30d'\);/g,
        "const [timeFilter, setTimeFilter] = useState('30d');\n  const [activeTab, setActiveTab] = useState<'performance' | 'monetization'>('performance');"
    );
}

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Updated state and data fetching');
