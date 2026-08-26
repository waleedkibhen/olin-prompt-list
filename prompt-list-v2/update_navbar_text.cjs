const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  /<h2 style=\{\{ margin: '0 0 0\.5rem 0', fontSize: '1\.5rem', fontWeight: 700, color: '#fff' \}\}>Welcome Back<\/h2>/,
  "<h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#fff', textAlign: 'center' }}>Welcome to Olin's Prompt List</h2>"
);

code = code.replace(
  /<p style=\{\{ margin: '0 0 1\.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0\.9rem' \}\}>Sign in to continue to your dashboard and create prompts\.<\/p>/,
  "<p style={{ margin: '0 0 1.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0.9rem' }}>Authenticate to continue your browsing experience.</p>"
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar modal text");
