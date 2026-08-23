const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// Fix Ghost Button
code = code.replace(
    /\{isCreator && effectiveMonetization !== 'free' && \(/g,
    "{isCreator && effectiveMonetization === 'charge' && ("
);

// Add Skeleton Loader
const skeletonStr = `
                      {effectiveMonetization === 'ad_supported' && !adDelayComplete ? (
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                          <div style={{ height: '1rem', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                          <div style={{ height: '1rem', width: '85%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                          <div style={{ height: '1rem', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                        </div>
                      ) : (
                        <div className={styles.promptTextContainer} style={{ color: 'var(--text-primary)' }}>
                          <RichTextRenderer 
                            content={effectivePrompts[parseInt(activeTab.split('-')[1] || '0')]} 
                            className={styles.promptCode} 
                          />
                        </div>
                      )}
`;

code = code.replace(
    /<div className=\{styles\.promptTextContainer\} style=\{\{ color: 'var\(--text-primary\)' \}\}>\s*<RichTextRenderer \s*content=\{effectivePrompts\[parseInt\(activeTab\.split\('-'\)\[1\] \|\| '0'\)\]\} \s*className=\{styles\.promptCode\} \s*\/>\s*<\/div>/,
    skeletonStr
);

const skeletonStr2 = `
                    {effectiveMonetization === 'ad_supported' && !adDelayComplete ? (
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                          <div style={{ height: '1rem', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                          <div style={{ height: '1rem', width: '85%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                          <div style={{ height: '1rem', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}></div>
                        </div>
                    ) : (
                      <div className={styles.promptTextContainer} style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <RichTextRenderer content={post.description || ''} className={styles.promptCode} />
                      </div>
                    )}
`;

code = code.replace(
    /<div className=\{styles\.promptTextContainer\} style=\{\{ marginTop: '0\.5rem', marginBottom: '1\.rem' \}\}>\s*<RichTextRenderer content=\{post\.description \|\| ''\} className=\{styles\.promptCode\} \/>\s*<\/div>/,
    skeletonStr2
);

// Try simpler replace for the second one if it fails (typo in margin 1.rem)
code = code.replace(
    /<div className=\{styles\.promptTextContainer\} style=\{\{ marginTop: '0\.5rem', marginBottom: '1rem' \}\}>\s*<RichTextRenderer content=\{post\.description \|\| ''\} className=\{styles\.promptCode\} \/>\s*<\/div>/,
    skeletonStr2
);

fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Fixed Ghost Button and added Skeletons');
