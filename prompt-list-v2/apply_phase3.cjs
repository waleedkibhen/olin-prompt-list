const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// 1. Ghost button
code = code.replace(
    /\{isCreator && effectiveMonetization !== 'free' && \(/g,
    "{isCreator && effectiveMonetization === 'charge' && ("
);

// 2. State
const stateImportTarget = "const [isReportModalOpen, setIsReportModalOpen] = useState(false);";
const stateImportStr = `const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [adDelayComplete, setAdDelayComplete] = useState(false);

  useEffect(() => {
    if (effectiveMonetization === 'ad_supported') {
      const timer = setTimeout(() => {
        setAdDelayComplete(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setAdDelayComplete(true);
    }
  }, [effectiveMonetization]);`;

code = code.replace(stateImportTarget, stateImportStr);

// 3. Skeleton for Prompts + Hide Copy Button
const targetPromptStr = `                      <>
                        <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                          <RichTextRenderer 
                            content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                            className={styles.promptCode} 
                          />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '0.5rem' }}>
                          <button 
                            onClick={handleCopyPrompt}`;

const repPromptStr = `                      <>
                        {effectiveMonetization === 'ad_supported' && !adDelayComplete ? (
                          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                            <div style={{ height: '1rem', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                            <div style={{ height: '1rem', width: '85%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                            <div style={{ height: '1rem', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
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
                              onClick={handleCopyPrompt}`;
                              
code = code.replace(targetPromptStr, repPromptStr);

// Close the tag for the first replacement
const targetPromptEndStr = `                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                      </>`;

const repPromptEndStr = `                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          </>
                        )}
                      </>`;

code = code.replace(targetPromptEndStr, repPromptEndStr);


// 4. Skeleton for Description
const targetDescStr = `                  <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                  </div>`;

const repDescStr = `                  <>
                    {effectiveMonetization === 'ad_supported' && !adDelayComplete ? (
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ height: '1rem', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                        <div style={{ height: '1rem', width: '85%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                        <div style={{ height: '1rem', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                      </div>
                    ) : (
                      <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                      </div>
                    )}
                  </>`;

code = code.replace(targetDescStr, repDescStr);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Applied Phase 3 tweaks');
