const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

const uiTarget = `<div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>`;
const uiReplacement = `<div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <DollarSign size={22} style={{ color: '#10b981' }} />
          <span>Global Ad Pool Management</span>
        </h2>
        
        {isAdPoolLoading ? (
          <div style={{ color: '#94a3b8' }}>Loading pool data...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>CURRENT ADSTERRA BALANCE</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#f8fafc' }}>$</span>
                <input 
                  type="number"
                  value={adPoolInput}
                  onChange={e => setAdPoolInput(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '1.1rem', width: '120px' }}
                />
                <button 
                  onClick={handleUpdateAdPool}
                  disabled={isUpdatingAdPool}
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: isUpdatingAdPool ? 'not-allowed' : 'pointer', opacity: isUpdatingAdPool ? 0.7 : 1 }}
                >
                  {isUpdatingAdPool ? 'Updating...' : 'Update Pool'}
                </button>
              </div>
            </div>

            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>PLATFORM FEE ({adPoolBalance < 1000 ? '20%' : '30%'})</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                ${(adPoolBalance * (adPoolBalance < 1000 ? 0.20 : 0.30)).toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>DISTRIBUTABLE CREATOR POOL</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                ${(adPoolBalance * (adPoolBalance < 1000 ? 0.80 : 0.70)).toFixed(2)}
              </div>
            </div>
            
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>TOTAL PLATFORM AD VIEWS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                {totalPlatformAdViews.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#090d16', border: '1px solid #1e293b', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>`;

code = code.replace(uiTarget, uiReplacement);

// Need to make sure DollarSign is imported
if (!code.includes('DollarSign')) {
  code = code.replace(/Loader2, Sparkles \} from 'lucide-react';/, `Loader2, Sparkles, DollarSign } from 'lucide-react';`);
}

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added Ad Pool UI to AdminDashboardPage");
