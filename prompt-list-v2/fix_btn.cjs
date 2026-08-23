const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /Pay \$\\{post\.price \|\| '1\.99'\\} to Unlock\s*<\/button>/g;
const replacementButton = `Pay \${post.price || '1.99'} to Unlock
                                </button>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #888)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                  <Lock size={12} /> Checkout secured by Whop
                                </div>`;
code = code.replace(regex, replacementButton);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed button text');
