const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

// The marker we want to inject after is this specific pattern:
const marker = `                              )}
                            </div>
                          </div>
                        </div>
                      ) : (`;

const addition = `                        {effectiveMonetization === 'charge' && (
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.4)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                            <Lock size={14} /> Secure Checkout Powered by Whop
                          </div>
                        )}
`;

if (code.includes(marker)) {
    code = code.replace(marker, `                              )}
                            </div>
                          </div>
                        </div>
${addition}                      ) : (`);
    fs.writeFileSync('src/components/PromptCard.tsx', code);
    console.log("Injected using exact string match");
} else {
    console.log("Could not find the exact marker string. Let's try finding the lines...");
    
    // Alternative approach
    const lines = code.split('\n');
    let injectIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<PlayCircle size={18} /> Watch Ad')) {
            // Found Watch Ad button. The structure is:
            //   <PlayCircle size={18} /> Watch Ad
            // </button>
            // )}
            // </div>
            // </div>
            // </div>
            // ) : (
            injectIndex = i + 6;
            break;
        }
    }
    
    if (injectIndex !== -1) {
        lines.splice(injectIndex, 0, addition);
        fs.writeFileSync('src/components/PromptCard.tsx', lines.join('\n'));
        console.log("Injected using line numbers");
    } else {
        console.log("Could not find insertion point!");
    }
}

