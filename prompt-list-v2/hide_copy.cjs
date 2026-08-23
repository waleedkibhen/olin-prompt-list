const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// I will just wrap the copy button conditionally
code = code.replace(
    /<div style=\{\{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0\.5rem' \}\}>/g,
    "{(!(!adDelayComplete && effectiveMonetization === 'ad_supported')) && (<div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>"
);

// We need to close the conditional tag after the button
code = code.replace(
    /<\/span>\s*<\/button>\s*<\/div>\s*<\/>/g,
    "</span>\n                          </button>\n                        </div>)}\n                      </>"
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed copy button visibility');
