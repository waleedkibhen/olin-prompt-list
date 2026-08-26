const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const injectStr = `
    <!-- Monetag In-Page Push Banner (Test Placement) -->
    <script>(function(s){s.dataset.zone='11642779',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
`;

code = code.replace('<head>', '<head>' + injectStr);
fs.writeFileSync('index.html', code);
console.log("Injected in-page push into index.html");
