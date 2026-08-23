const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Add Lock to imports
code = code.replace(/import \{ Heart, Bookmark, /, 'import { Heart, Bookmark, Lock, ');

// Replace Title
code = code.replace(
  /{effectiveMonetization === 'subscribers_only' \? 'Subscriber Vault' : effectiveMonetization === 'charge' \? 'Premium Vault' : 'Watch an Ad to unlock'}/g,
  `{effectiveMonetization === 'subscribers_only' ? 'Subscriber Vault' : effectiveMonetization === 'charge' ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Lock size={18} /> Premium Prompt</span> : 'Watch an Ad to unlock'}`
);

// Replace Subtitle
code = code.replace(
  /'Unlock to reveal full generative parameters, styling seeds, and camera weights\.'/g,
  `'Pay to unlock full prompt.'`
);

// Add "Checkout secured by Whop" below the charge button
const buttonPattern = `Pay \\$\\{post.price \\|\\| '1.99'\\} to Unlock
                                </button>`;
const replacementButton = `Pay \${post.price || '1.99'} to Unlock
                                </button>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary, #888)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                  <Lock size={12} /> Checkout secured by Whop
                                </div>`;
code = code.replace(buttonPattern, replacementButton);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('UI updated');
