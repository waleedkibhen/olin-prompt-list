const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

const regex = /<header className=\{styles\.header\}>[\s\S]*?<\/header>/;

const newHeader = `      <header className={styles.header}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.title}>Creator Dashboard</h1>
          <p className={styles.subtitle}>
            Manage your analytical performance and prompt monetization.
          </p>
          {user && (
            <div className={styles.tabContainer}>
              <button 
                className={\`\${styles.tab} \${activeTab === 'performance' ? styles.tabActive : ''}\`}
                onClick={() => setActiveTab('performance')}
              >
                Performance
              </button>
              <button 
                className={\`\${styles.tab} \${activeTab === 'monetization' ? styles.tabActive : ''}\`}
                onClick={() => setActiveTab('monetization')}
              >
                Monetization
              </button>
            </div>
          )}
        </div>
        {user && activeTab === 'performance' && (
          <div className={styles.timeFilterContainer} style={{ marginTop: '1rem' }}>
            <select 
              className={styles.timeSelect} 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        )}
      </header>`;

code = code.replace(regex, newHeader);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Fixed Header successfully.');
