const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\) : effectiveMonetization === 'charge' \? \([\s\S]*?Pay \$\{post\.price \|\| '1\.99'\} to Unlock\r?\n\s*<\/button>\r?\n\s*\}/;

const replacement = `) : effectiveMonetization === 'charge' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); if (post.whopPlanId) { setShowCheckout(true); } else { alert('Creator has not setup a valid checkout for this item yet.'); } }}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Pay \${post.price || '1.99'} to Unlock
                              </button>
                            ) : null}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Fixed syntax");
