const fs = require('fs');
let code = fs.readFileSync('src/components/PromptCard.tsx', 'utf8');

const targetStyle = `style={{ background: '#0572F6', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}`;
const replacementStyle = `style={{ background: effectiveMonetization === 'charge' ? '#8b5cf6' : '#0572F6', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}`;

code = code.replace(targetStyle, replacementStyle);
fs.writeFileSync('src/components/PromptCard.tsx', code);
console.log('Button background updated');
