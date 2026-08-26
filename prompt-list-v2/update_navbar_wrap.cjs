const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Use non-breaking space for 'browsing experience.' to prevent it from being isolated on a new line.
// Alternatively, setting textWrap: 'balance' ensures it breaks evenly.
code = code.replace(
  /<p style=\{\{ margin: '0 0 1\.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0\.9rem' \}\}>Authenticate to continue your browsing experience\.<\/p>/,
  "<p style={{ margin: '0 0 1.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0.9rem', textWrap: 'balance', padding: '0 1rem' }}>Authenticate to continue your browsing experience.</p>"
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar text wrap");
