const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Change the subtitle text
code = code.replace(
  /'Pay to unlock full prompt\.'/g,
  `'This creator has opted to sell this prompt for money. Pay to unlock the full prompt.'`
);

// 2. Remove the existing checkout note from inside the button area
const badNotePattern = /<div style=\{\{ fontSize: '0\.75rem', color: 'var\(--text-tertiary, #888\)', marginTop: '0\.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0\.25rem' \}\}>\s*<Lock size=\{12\} \/> Checkout secured by Whop\s*<\/div>/g;
code = code.replace(badNotePattern, '');

// 3. Add the note right below the blurredVaultContainer
const vaultEndPattern = /<\/div>\s*<\/div>\s*<\/div>\s*(<div className=\{styles\.vaultHeader\})/;
const replacementVaultEnd = `</div>
                          </div>
                        </div>
                        {effectiveMonetization === 'charge' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #888)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <Lock size={12} /> Secure Checkout Powered by Whop
                          </div>
                        )}
                        $1`;

code = code.replace(vaultEndPattern, replacementVaultEnd);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('UI updated');
