const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// Update isProtected to be true for creators too, so they see what users see
code = code.replace(
  /const isProtected = Boolean\(effectiveMonetization !== 'free' && !isUnlocked && !isCreator\);/,
  "const isProtected = Boolean(effectiveMonetization !== 'free' && !isUnlocked);"
);

// Replace the Vault UI
const startStr = '<div className={styles.vaultOverlayContent}';
const endStr = '</div>\r\n                        </div>\r\n                      ) : (';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  const newVault = `<div className={styles.vaultOverlayContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 1rem' }}>
                          <div style={{ flex: 1, padding: '1.5rem', border: \`1px solid \${effectiveMonetization === 'charge' ? '#3b82f6' : 'rgba(16, 185, 129, 0.3)'}\`, borderRadius: '0px', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                {effectiveMonetization === 'subscribers_only' ? 'Subscriber Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Watch an ad to unlock'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                {effectiveMonetization === 'ad_supported' ? 'Watch an ad to unlock the prompt and support your favorite creators.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights.'}
                            </div>
                            
                            {isCreator ? (
                              <button
                                onClick={() => setIsUnlocked(true)}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'transparent', color: '#10b981', border: '1px solid #10b981', borderRadius: '0px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                View Your Prompt (Creator)
                              </button>
                            ) : effectiveMonetization === 'subscribers_only' ? (
                              <button
                                onClick={handleSubscribeToUnlock}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '0px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Subscribe to Unlock
                              </button>
                            ) : effectiveMonetization === 'charge' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); alert('Payment infrastructure coming soon!'); handleWatchAdToUnlock(e); }}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '0px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Pay $\${post.price || '1.99'} to Unlock
                              </button>
                            ) : (
                              <button
                                onClick={handleWatchAdToUnlock}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <PlayCircle size={18} /> Watch Ad
                              </button>
                            )}
                          </div>
                        `;
  code = code.substring(0, startIndex) + newVault + code.substring(endIndex);
} else {
  console.log("Could not find boundaries");
}

fs.writeFileSync(p, code);
console.log('done');
