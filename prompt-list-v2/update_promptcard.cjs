const fs = require('fs');
const path = require('path');
const p = path.join('src', 'components', 'PromptCard.tsx');
let code = fs.readFileSync(p, 'utf8');

// Update Paywall UI
const oldPaywall = `                            {effectiveMonetization === 'subscribers_only' ? (
                              <button
                                className={styles.whopUnlockBtn}
                                onClick={handleSubscribeToUnlock}
                                style={{ background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b' }}
                              >
                                Subscribe to Unlock
                              </button>
                            ) : (
                              <button
                                className={styles.whopUnlockBtn}
                                onClick={handleWatchAdToUnlock}
                                style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <PlayCircle size={18} />
                                <span>Watch an Ad to Unlock Prompt</span>
                              </button>
                            )}`;

const newPaywall = `                            {effectiveMonetization === 'subscribers_only' ? (
                              <button
                                className={styles.whopUnlockBtn}
                                onClick={handleSubscribeToUnlock}
                                style={{ background: 'transparent', border: '1px solid #f59e0b', color: '#f59e0b' }}
                              >
                                Subscribe to Unlock
                              </button>
                            ) : effectiveMonetization === 'charge' ? (
                              <button
                                className={styles.whopUnlockBtn}
                                onClick={(e) => { e.stopPropagation(); alert('Payment infrastructure coming soon!'); handleWatchAdToUnlock(e); }}
                                style={{ background: 'transparent', border: '1px solid #3b82f6', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <span>Pay ${'$'}{post.price || '1.99'} to Unlock Prompt</span>
                              </button>
                            ) : (
                              <button
                                className={styles.whopUnlockBtn}
                                onClick={handleWatchAdToUnlock}
                                style={{ background: 'transparent', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                              >
                                <PlayCircle size={18} />
                                <span>Watch an Ad to Unlock Prompt</span>
                              </button>
                            )}`;

if (code.includes(oldPaywall)) {
  code = code.replace(oldPaywall, newPaywall);
  console.log('Updated paywall buttons');
} else {
  console.log('Could not find old paywall UI');
}

// Update the lockBadgePill
const oldPill = `                            <div className={styles.lockBadgePill} style={effectiveMonetization === 'ad_supported' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981' } : {}}>
                              {effectiveMonetization === 'subscribers_only' ? 'Subscriber Only Vault' : 'Free Ad-Supported Vault'}
                            </div>`;
const newPill = `                            <div className={styles.lockBadgePill} style={effectiveMonetization === 'ad_supported' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981' } : effectiveMonetization === 'charge' ? { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#3b82f6' } : {}}>
                              {effectiveMonetization === 'subscribers_only' ? 'Subscriber Only Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Free Ad-Supported Vault'}
                            </div>`;

if (code.includes(oldPill)) {
  code = code.replace(oldPill, newPill);
  console.log('Updated badge pill');
} else {
  console.log('Could not find old pill UI');
}

// Modify the ad script injection to inject into document.head instead of document.body
code = code.replace("document.body.appendChild(script);", "document.head.appendChild(script);");

fs.writeFileSync(p, code);
