const fs = require('fs');
const path = require('path');
const p = path.join('src', 'pages', 'CreatePostPage.tsx');
let code = fs.readFileSync(p, 'utf8');

// Add state variables
if (!code.includes('const [monetizationType, setMonetizationType] = useState')) {
  code = code.replace(
    /const \[customModel, setCustomModel\] = useState\(''\);/,
    "const [customModel, setCustomModel] = useState('');\n  const [monetizationType, setMonetizationType] = useState<'free'|'paid'>('free');\n  const [paidUnlockMethod, setPaidUnlockMethod] = useState<'charge'|'ad'>('ad');\n  const [price, setPrice] = useState('1.99');"
  );
}

// Update the postPayload
code = code.replace(
  /monetizationType: 'free',/,
  "monetizationType: monetizationType === 'free' ? 'free' : (paidUnlockMethod === 'ad' ? 'ad_supported' : 'charge'),\n          price: monetizationType === 'paid' && paidUnlockMethod === 'charge' ? parseFloat(price) || 0 : 0,"
);

// Add the UI section right before the submit button
const submitBtnStr = '<button type="submit" className={styles.publishBtn} disabled={isScanning || selectedFiles.length === 0}>';
const uiCode = `
          <div className={styles.fieldGroup} style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <label style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={18} style={{ color: '#f59e0b' }} /> Monetization Options</label>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div 
                style={{ flex: 1, padding: '1rem', border: \`2px solid \${monetizationType === 'free' ? '#3b82f6' : 'var(--border-color)'}\`, borderRadius: '8px', cursor: 'pointer', backgroundColor: monetizationType === 'free' ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}
                onClick={() => setMonetizationType('free')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Free</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Anyone can view your prompt</div>
              </div>
              <div 
                style={{ flex: 1, padding: '1rem', border: \`2px solid \${monetizationType === 'paid' ? '#10b981' : 'var(--border-color)'}\`, borderRadius: '8px', cursor: 'pointer', backgroundColor: monetizationType === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'transparent' }}
                onClick={() => setMonetizationType('paid')}
              >
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Paid / Protected</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Require users to unlock your prompt</div>
              </div>
            </div>

            {monetizationType === 'paid' && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '1rem', display: 'block' }}>Unlock Method</label>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div 
                    style={{ flex: 1, padding: '0.75rem', border: \`1px solid \${paidUnlockMethod === 'ad' ? '#10b981' : 'var(--border-color)'}\`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setPaidUnlockMethod('ad')}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: \`5px solid \${paidUnlockMethod === 'ad' ? '#10b981' : 'var(--border-color)'}\`, backgroundColor: 'transparent' }} />
                    <span style={{ fontWeight: 500 }}>Watch an Ad</span>
                  </div>
                  
                  <div 
                    style={{ flex: 1, padding: '0.75rem', border: \`1px solid \${paidUnlockMethod === 'charge' ? '#10b981' : 'var(--border-color)'}\`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                    onClick={() => setPaidUnlockMethod('charge')}
                  >
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: \`5px solid \${paidUnlockMethod === 'charge' ? '#10b981' : 'var(--border-color)'}\`, backgroundColor: 'transparent' }} />
                    <span style={{ fontWeight: 500 }}>Charge to Unlock</span>
                  </div>
                </div>

                {paidUnlockMethod === 'charge' && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.85rem' }}>Price (USD)</label>
                    <div style={{ position: 'relative', marginTop: '0.5rem' }}>
                      <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        min="0.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={styles.plainInput}
                        style={{ paddingLeft: '2rem' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
`;

if (!code.includes('Monetization Options')) {
  code = code.replace(submitBtnStr, uiCode + '\n          ' + submitBtnStr);
}

fs.writeFileSync(p, code);
console.log('done');
