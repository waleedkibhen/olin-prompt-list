const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Change the subtext
code = code.replace(
  /'This creator has opted to sell this prompt for money\. Pay to unlock the full prompt\.'/g,
  `'This creator has opted to charge users for this prompt.'`
);

// Let's find exactly where to put the "Secure Checkout" note.
// I'll search for the end of the blurredVaultContainer.
const vaultEndPattern = /<\/div>\s*<\/div>\s*<\/div>\s*\{effectiveMonetization === 'charge' && \(\s*<div style=\{\{ fontSize: '0\.75rem', color: 'var\(--text-tertiary, #888\)', marginTop: '0\.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0\.25rem' \}\}>\s*<Lock size=\{12\} \/> Secure Checkout Powered by Whop\s*<\/div>\s*\)\}/g;

const replacementVaultEnd = `</div>
                          </div>
                        </div>
                        {effectiveMonetization === 'charge' && (
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                            <Lock size={14} /> Secure Checkout Powered by Whop
                          </div>
                        )}`;

if (vaultEndPattern.test(code)) {
    code = code.replace(vaultEndPattern, replacementVaultEnd);
} else {
    // If it wasn't there, insert it.
    const fallbackPattern = /<\/div>\s*<\/div>\s*<\/div>\s*(<div className=\{styles\.vaultHeader\})/;
    code = code.replace(fallbackPattern, replacementVaultEnd + '\n                        $1');
}

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('UI updated');
