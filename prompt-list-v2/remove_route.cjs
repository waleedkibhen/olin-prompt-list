const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/const UnlockAdPage = lazy\(\(\) => import\('@\/pages\/UnlockAdPage'\)\);\r?\n/, '');
code = code.replace(/<Route path="\/unlock\/:id" element=\{<UnlockAdPage \/>\} \/>\r?\n\s*/, '');
fs.writeFileSync('src/App.tsx', code);
console.log("Removed UnlockAdPage route from App.tsx");
