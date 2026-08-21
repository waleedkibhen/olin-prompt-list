const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// 1. Update Title and Subtext, and the Watch Ad button
code = code.replace(
  /\{effectiveMonetization === 'subscribers_only' \? 'Subscriber Vault' : effectiveMonetization === 'charge' \? 'Premium Vault' : 'Watch an ad to unlock'\}/,
  "{effectiveMonetization === 'subscribers_only' ? 'Subscriber Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Watch an Ad to unlock'}"
);

code = code.replace(
  /\{effectiveMonetization === 'ad_supported' \? 'Watch an ad to unlock the prompt and support your favorite creators\.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights\.'\}/,
  "{effectiveMonetization === 'ad_supported' ? 'The creator has chosen to monetize their prompts through ads. Click the button below to view a quick sponsor message or click the button below to watch an ad to reveal the prompt.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights.'}"
);

// Update Watch Ad button
// Current: style={{ width: '100%', padding: '0.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
code = code.replace(
  /backgroundColor: '#10b981'(.+?)borderRadius: '0px'/,
  "backgroundColor: '#1E50FF'$1borderRadius: '2px'"
);

// 2. Update Preview Paywall button
// Current: style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
// Content: Preview Paywall
const oldPreviewBtn = `<button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(true); }}
                              style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Preview Paywall
                            </button>`;
const newPreviewBtn = `<button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(true); }}
                              style={{ background: '#1E50FF', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <Eye size={14} color="#fff" /> Preview Paywall
                            </button>`;
code = code.replace(oldPreviewBtn, newPreviewBtn);

fs.writeFileSync(p, code);
console.log('updated promptcard');
