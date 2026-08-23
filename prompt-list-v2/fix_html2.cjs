const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const t = `    <!-- Whop Checkout JS -->
    <script src="https://checkout.whop.com/checkout.js"></script>`;

code = code.replace(t, '');
fs.writeFileSync('index.html', code);
console.log('Removed broken script');
