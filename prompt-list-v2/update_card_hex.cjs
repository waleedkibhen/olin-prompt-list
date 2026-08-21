const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

// Replace all #1E50FF with #1754D8
code = code.replace(/#1E50FF/g, '#1754D8');

// Remove absolute positioned Stop Preview button
const stopBtnRegex = /\{\s*isCreator\s*&&\s*previewPaywall\s*&&\s*\([\s\S]*?<div style=\{\{\s*position:\s*'absolute'[\s\S]*?<\/div>\s*\)\s*\}/;
code = code.replace(stopBtnRegex, "");

// Remove trailing Preview Paywall button
const previewBtnRegex = /\{\s*isCreator\s*&&\s*effectiveMonetization\s*!==\s*'free'\s*&&\s*\([\s\S]*?<div style=\{\{\s*display:\s*'flex'[\s\S]*?Preview Paywall[\s\S]*?<\/div>\s*\)\s*\}/;
code = code.replace(previewBtnRegex, "");

// Now inject the new toggle at the very top of activeTab.startsWith('prompt')
const injectionPoint = `<div className={styles.promptVaultBox}>`;
const newToggle = `<div className={styles.promptVaultBox}>
                      {isCreator && effectiveMonetization !== 'free' && (
                        <div style={{ marginBottom: '0.75rem', display: 'flex' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setPreviewPaywall(!previewPaywall); }}
                            style={{ background: '#1754D8', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          >
                            {previewPaywall ? (
                              <><X size={12} color="#fff" /> Stop Preview</>
                            ) : (
                              <><Eye size={12} color="#fff" /> Preview Paywall</>
                            )}
                          </button>
                        </div>
                      )}`;

code = code.replace(injectionPoint, newToggle);

// Replace subtitle string
const subtitleRegex = /\{effectiveMonetization === 'ad_supported' \? 'The creator has chosen to monetize their prompts through ads\. Click the button below to view a quick sponsor message or click the button below to watch an ad to reveal the prompt\.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights\.'\}/;
code = code.replace(subtitleRegex, "{effectiveMonetization === 'ad_supported' ? 'The creator has chosen to monetize their prompts through ads. Click the button below to watch an ad.' : 'Unlock to reveal full generative parameters, styling seeds, and camera weights.'}");

fs.writeFileSync(p, code);
console.log('updated prompt card');
