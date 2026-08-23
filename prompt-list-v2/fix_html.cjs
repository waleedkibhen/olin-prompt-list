const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const t = `    <title id="meta-title">Olin's Prompt List</title>`;
const r = `    <!-- Whop Checkout JS -->
    <script src="https://checkout.whop.com/checkout.js"></script>
    <title id="meta-title">Olin's Prompt List</title>`;

code = code.replace(t, r);
fs.writeFileSync('index.html', code);
console.log('Added Whop script');
