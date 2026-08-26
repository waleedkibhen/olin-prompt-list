const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const regex = /\{isAdSupported && !adDelayComplete \? \(\r?\n\s*<div className=\{styles\.skeletonBox\} \/>\r?\n\s*\) : \(/;

const replacement = `{isAdSupported && !isUnlocked ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Unlock this Prompt</h3>
                            <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '300px' }}>
                              The creator has chosen to monetize this prompt through ads. Click below to support them and unlock the prompt.
                            </p>
                            <button
                                onClick={handleWatchAdToUnlock}
                                style={{ width: '100%', maxWidth: '250px', padding: '0.85rem', backgroundColor: '#0572F6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                Watch Ad to Unlock
                            </button>
                          </div>
                        ) : isAdSupported && !adDelayComplete ? (
                          <div className={styles.skeletonBox} />
                        ) : (`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Added clean unlocked ad button");
