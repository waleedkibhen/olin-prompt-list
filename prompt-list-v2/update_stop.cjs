const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const oldStopBtn = `<button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(false); }}
                              style={{ background: 'transparent', border: '1px solid rgba(16, 185, 129, 0.5)', color: '#10b981', borderRadius: '0px', padding: '0.3rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 700 }}
                            >
                              Stop Preview
                            </button>`;
const newStopBtn = `<button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewPaywall(false); }}
                              style={{ background: '#1E50FF', border: 'none', color: '#fff', borderRadius: '4px', padding: '0.4rem 0.8rem', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                              <X size={14} color="#fff" /> Stop Preview
                            </button>`;
code = code.replace(oldStopBtn, newStopBtn);

fs.writeFileSync(p, code);
console.log('updated stop button');
