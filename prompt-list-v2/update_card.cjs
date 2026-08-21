const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// 1. Re-add previewPaywall state
const stateInsertPoint = code.indexOf('const [isUnlocked, setIsUnlocked] = useState(false);');
if (!code.includes('previewPaywall')) {
  code = code.substring(0, stateInsertPoint) + 
    'const [previewPaywall, setPreviewPaywall] = useState(false);\n  ' + 
    code.substring(stateInsertPoint);
}

// 2. Fix isProtected
code = code.replace(
  /const isProtected = Boolean\(effectiveMonetization !== 'free' && !isUnlocked\);/,
  "const isProtected = Boolean(effectiveMonetization !== 'free' && (!isUnlocked || (isCreator && previewPaywall)));"
);

// 3. Remove inline border from inner div and remove "View Your Prompt (Creator)" button
const innerDivRegex = /<div style=\{\{ flex: 1, padding: '1\.5rem', border: `1px solid \$\{effectiveMonetization === 'charge' \? '#3b82f6' : 'rgba\(16, 185, 129, 0\.3\)'\}`[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\) : \(/;
const newInnerDiv = `<div style={{ flex: 1, padding: '1.5rem', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                {effectiveMonetization === 'subscribers_only' ? 'Subscriber Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Watch an ad to unlock'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                                {effectiveMonetization === 'ad_supported' ? 'Watch an ad to unlock the prompt and support your favorite creators.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights.'}
                            </div>
                            
                            {effectiveMonetization === 'subscribers_only' ? (
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
                        </div>
                      </div>
                    ) : (`;
code = code.replace(innerDivRegex, newInnerDiv);

// 4. Add the creator toggle below the prompt text when they are viewing it
// We need to find where the prompt text is rendered and add the toggle.
const promptTextRegex = /<div className=\{styles\.promptTextContainer\} style=\{\{ color: 'var\(--text-primary\)' \}\}>\s*<RichTextRenderer\s*content=\{effectivePrompts\[parseInt\(activeTab\.split\('-'\)\[1\] \|\| '0'\)\]\}\s*className=\{styles\.promptCode\}\s*\/>\s*<\/div>/;

const promptTextWithToggle = `<div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                          <RichTextRenderer 
                            content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                            className={styles.promptCode} 
                          />
                        </div>
                        {isCreator && effectiveMonetization !== 'free' && (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(true); }}
                              style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Preview Paywall
                            </button>
                          </div>
                        )}`;
code = code.replace(promptTextRegex, promptTextWithToggle);

// And we need a way to go BACK to the prompt from the paywall preview!
// We can add a "Hide Preview" button if previewPaywall is true.
const backToggleRegex = /<div className=\{styles\.vaultOverlayContent\} style=\{\{ display: 'flex', flexDirection: 'column'/;
const backToggleInsert = `{isCreator && previewPaywall && (
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(false); }}
                              style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Stop Preview
                            </button>
                          </div>
                        )}
                        <div className={styles.vaultOverlayContent} style={{ display: 'flex', flexDirection: 'column'`;
code = code.replace(backToggleRegex, backToggleInsert);


fs.writeFileSync(p, code);
console.log("Updated PromptCard");
