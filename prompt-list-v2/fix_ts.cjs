const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalAdManager.tsx', 'utf8');

code = code.replace(/const aNode = node as HTMLAnchorElement;/g, "const aNode = node as unknown as HTMLAnchorElement;");
code = code.replace(/return originalAppendChild\.call\(this, node\);/g, "return originalAppendChild.call(this, node) as T;");

fs.writeFileSync('src/components/GlobalAdManager.tsx', code);
console.log("Fixed GlobalAdManager TS errors");
