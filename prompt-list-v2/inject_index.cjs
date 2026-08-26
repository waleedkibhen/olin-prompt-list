const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

if (!code.includes('vignette.min.js')) {
    const injectStr = `
    <!-- Monetag Vignette Ad Script (Global) -->
    <script>(function(s){s.dataset.zone='11641986',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
    `;
    code = code.replace('</head>', injectStr + '\n  </head>');
    fs.writeFileSync('index.html', code);
    console.log("Injected Monetag into index.html");
} else {
    console.log("Monetag already in index.html");
}
