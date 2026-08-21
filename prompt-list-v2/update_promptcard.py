import re

with open("src/components/PromptCard.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update pill
pill_regex = r'<div className=\{styles\.lockBadgePill\}[^>]*>[\s\S]*?</div>'
new_pill = r'''<div className={styles.lockBadgePill} style={effectiveMonetization === 'ad_supported' ? { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#10b981' } : effectiveMonetization === 'charge' ? { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#3b82f6' } : {}}>
                              {effectiveMonetization === 'subscribers_only' ? 'Subscriber Only Vault' : effectiveMonetization === 'charge' ? 'Premium Vault' : 'Free Ad-Supported Vault'}
                            </div>'''

content = re.sub(pill_regex, new_pill, content, count=1)

# Update buttons
buttons_regex = r'\{effectiveMonetization === \'subscribers_only\' \? \([\s\S]*?<button\s+className=\{styles\.whopUnlockBtn\}\s+onClick=\{handleSubscribeToUnlock\}[\s\S]*?Subscribe to Unlock\s*</button>\s*\)\s*:\s*\([\s\S]*?<button\s+className=\{styles\.whopUnlockBtn\}\s+onClick=\{handleWatchAdToUnlock\}[\s\S]*?Watch an Ad to Unlock Prompt\s*</span>\s*</button>\s*\)\}'
new_buttons = r'''{effectiveMonetization === 'subscribers_only' ? (
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
                                <span>Pay ${post.price || '1.99'} to Unlock Prompt</span>
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
                            )}'''

content = re.sub(buttons_regex, new_buttons, content)

with open("src/components/PromptCard.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PromptCard")
