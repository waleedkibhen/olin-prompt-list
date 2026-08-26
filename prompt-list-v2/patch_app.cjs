const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// import GlobalAdManager
const importStr = "import GlobalAdManager from '@/components/GlobalAdManager';\n";
code = code.replace("import Navbar from '@/components/Navbar';", importStr + "import Navbar from '@/components/Navbar';");

// Insert <GlobalAdManager /> right inside the <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
const renderRegex = /<div style=\{\{ minHeight: '100vh', display: 'flex', flexDirection: 'column' \}\}>\r?\n/;
const replacement = `<div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>\n      <GlobalAdManager />\n`;
code = code.replace(renderRegex, replacement);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx patched");
