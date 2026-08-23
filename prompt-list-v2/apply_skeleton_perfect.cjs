const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Check/Replace effectiveMonetization & isAdSupported & State
const effTarget = `  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free'));`;

const effReplacement = `  const effectiveMonetization = !ENABLE_MONETIZATION ? 'free' : (post.monetizationType === 'ad' ? 'ad_supported' : (post.monetizationType || (post.isPaid ? 'subscribers_only' : 'free')));
  const isAdSupported = Boolean(effectiveMonetization === 'ad_supported' || post.monetizationType === 'ad_supported' || post.monetizationType === 'ad');`;

if (code.includes(effTarget)) {
  code = code.replace(effTarget, effReplacement);
}

// 2. State & Effect
const effectTarget = `  const [adDelayComplete, setAdDelayComplete] = useState(false);

  useEffect(() => {
    if (effectiveMonetization === 'ad_supported') {
      if (isModalOpen) {
        setAdDelayComplete(false);
        const timer = setTimeout(() => {
          setAdDelayComplete(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setAdDelayComplete(false);
      }
    } else {
      setAdDelayComplete(true);
    }
  }, [effectiveMonetization, isModalOpen]);`;

const effectReplacement = `  const [adDelayComplete, setAdDelayComplete] = useState<boolean>(!isAdSupported);

  useEffect(() => {
    if (isAdSupported) {
      if (isModalOpen) {
        setAdDelayComplete(false);
        const timer = setTimeout(() => {
          setAdDelayComplete(true);
        }, 2000);
        return () => clearTimeout(timer);
      } else {
        setAdDelayComplete(false);
      }
    } else {
      setAdDelayComplete(true);
    }
  }, [isAdSupported, isModalOpen]);`;

if (code.includes(effectTarget)) {
  code = code.replace(effectTarget, effectReplacement);
}

// 3. JSX replacement for the prompt container
const promptJsxTarget = `                    ) : (
                      <>
                        <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                          <RichTextRenderer 
                            content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                            className={styles.promptCode} 
                          />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                          <button 
                            onClick={handleCopyPrompt}
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '8px', transition: 'all 0.2s ease' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                          >
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                  </div>
                )}`;

const promptJsxReplacement = `                    ) : (
                      <>
                        {isAdSupported && !adDelayComplete ? (
                          <div className={styles.skeletonContainer}>
                            <div className={styles.skeletonHeader}>
                              <div className={styles.skeletonDot} />
                              <span className={styles.skeletonLabel}>Unlocking generative prompt...</span>
                            </div>
                            <div className={styles.skeletonBar} style={{ width: '100%' }} />
                            <div className={styles.skeletonBar} style={{ width: '85%' }} />
                            <div className={styles.skeletonBar} style={{ width: '92%' }} />
                            <div className={styles.skeletonBar} style={{ width: '65%' }} />
                          </div>
                        ) : (
                          <>
                            <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                              <RichTextRenderer 
                                content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                                className={styles.promptCode} 
                              />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                              <button 
                                onClick={handleCopyPrompt}
                                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.4rem 0.75rem', borderRadius: '8px', transition: 'all 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}
                              >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  isAdSupported && !adDelayComplete ? (
                    <div className={styles.skeletonContainer}>
                      <div className={styles.skeletonHeader}>
                        <div className={styles.skeletonDot} />
                        <span className={styles.skeletonLabel}>Unlocking generative prompt...</span>
                      </div>
                      <div className={styles.skeletonBar} style={{ width: '100%' }} />
                      <div className={styles.skeletonBar} style={{ width: '85%' }} />
                      <div className={styles.skeletonBar} style={{ width: '92%' }} />
                    </div>
                  ) : (
                    <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                      <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                    </div>
                  )
                )}`;

if (code.includes(promptJsxTarget)) {
  code = code.replace(promptJsxTarget, promptJsxReplacement);
  console.log('Successfully replaced prompt JSX with skeleton loader!');
} else {
  console.log('FAILED to match promptJsxTarget directly');
}

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Updated PromptCard.tsx');
