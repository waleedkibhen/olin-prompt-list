const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// 1. Remove previewPaywall state
code = code.replace(/const \[previewPaywall, setPreviewPaywall\] = useState\(false\);\s*/, '');
code = code.replace(/setPreviewPaywall\(false\);\s*/, '');

// 2. Fix isProtected logic
code = code.replace(
  /const isProtected = Boolean\(effectiveMonetization !== 'free' && \(!isUnlocked \|\| \(isCreator && previewPaywall\)\)\);/,
  "const isProtected = Boolean(effectiveMonetization !== 'free' && !isUnlocked && !isCreator);"
);

// 3. Remove the Creator Access Enabled banner
const creatorBannerRegex = /\{isCreator && effectiveMonetization !== 'free' && \([\s\S]*?<\/button>\s*<\/div>\s*\)\}/;
code = code.replace(creatorBannerRegex, '');

// 4. Update handleWatchAdToUnlock to navigate to /unlock/:id
const watchAdRegex = /const handleWatchAdToUnlock = \(e\?: React\.MouseEvent\) => \{[\s\S]*?2800\);\s*\};/;
const newWatchAd = `const handleWatchAdToUnlock = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(\`/unlock/\${post.id}\`);
  };`;
code = code.replace(watchAdRegex, newWatchAd);

// 5. Replace Vault UI
const startStr = '<div className={styles.vaultOverlayContent}>';
const endStr = '</div>\r\n                      </div>\r\n                    ) : (';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);
if (startIndex !== -1 && endIndex !== -1) {
  const newVault = `<div className={styles.vaultOverlayContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0 1rem' }}>
                          <div style={{ flex: 1, padding: '1.5rem', border: \`2px solid \${effectiveMonetization === 'charge' ? '#3b82f6' : '#10b981'}\`, borderRadius: '8px', backgroundColor: effectiveMonetization === 'charge' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                {effectiveMonetization === 'subscribers_only' ? 'Subscriber Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Ad-Supported Vault'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                Unlock to reveal full generative parameters, styling seeds, and camera weights.
                            </div>
                            
                            {effectiveMonetization === 'subscribers_only' ? (
                              <button
                                onClick={handleSubscribeToUnlock}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#f59e0b', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Subscribe to Unlock
                              </button>
                            ) : effectiveMonetization === 'charge' ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); alert('Payment infrastructure coming soon!'); handleWatchAdToUnlock(e); }}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Pay $\${post.price || '1.99'} to Unlock
                              </button>
                            ) : (
                              <button
                                onClick={handleWatchAdToUnlock}
                                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <PlayCircle size={18} /> Watch Ad to Unlock
                              </button>
                            )}
                          </div>
                        `;
  code = code.substring(0, startIndex) + newVault + code.substring(endIndex);
}

fs.writeFileSync(p, code);
console.log('done');
