const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const oldCopyBtn = /<button\s*onClick=\{handleCopyPrompt\}[\s\S]*?<\/button>/;
const newCopyBtn = `<button 
                                  onClick={handleCopyPrompt}
                                  style={{ background: '#3b82f6', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', padding: '0.5rem 0.85rem', borderRadius: '8px', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                                >
                                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{isCopied ? 'Copied' : 'Copy'}</span>
                                </button>`;

code = code.replace(oldCopyBtn, newCopyBtn);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log("Updated Copy button in PromptCard");
