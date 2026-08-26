const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(!document\.body\.classList\.contains\('post-modal-open'\)\) \{\r?\n\s*e\.stopPropagation\(\);\r?\n\s*\}/;

const replacement = `const isDashboard = window.location.pathname === '/dashboard';
        if (!document.body.classList.contains('post-modal-open') && !isDashboard) {
          e.stopPropagation();
        }`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx interceptor");
