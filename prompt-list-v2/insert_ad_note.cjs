const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /<Lock size=\{14\} \/> Secure Checkout Powered by Whop\s*<\/div>\s*\)\}\s*<\/>/m;

const replacement = `<Lock size={14} /> Secure Checkout Powered by Whop
                            </div>
                          )}
                          {effectiveMonetization === 'ad_supported' && (
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                              <ExternalLink size={14} /> A new tab will open. Close it and return here to unlock.
                            </div>
                          )}
                        </>`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/PromptCard.tsx', code);
    console.log('Inserted ad note successfully.');
} else {
    console.log('Could not find match');
}
