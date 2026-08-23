const fs = require('fs');
let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');

// 1. Data fetching & state
code = code.replace(
    /isPaid: d\.isPaid \|\| false,\s*price: d\.price \|\| 0,/g,
    "isPaid: d.isPaid || false,\n          price: d.price || 0,\n          monetizationType: d.monetizationType || (d.isPaid ? 'charge' : 'free'),"
);

code = code.replace(
    /const \[timeFilter, setTimeFilter\] = useState\('30d'\);/g,
    "const [timeFilter, setTimeFilter] = useState('30d');\n  const [activeTab, setActiveTab] = useState<'performance' | 'monetization'>('performance');"
);

// 2. Derived arrays & stats
const derivedStr = `
  const monetizationPosts = React.useMemo(() => {
    return creatorPosts.filter(p => p.monetizationType === 'charge' || p.monetizationType === 'ad_supported');
  }, [creatorPosts]);

  const monetizationStats = React.useMemo(() => {
    let revenue = 0;
    let paidUnlocks = 0;
    let adUnlocks = 0;
    monetizationPosts.forEach(p => {
      if (p.monetizationType === 'charge') {
        revenue += (p.copiesCount || 0) * (p.price || 1.99);
        paidUnlocks += (p.copiesCount || 0);
      } else if (p.monetizationType === 'ad_supported') {
        revenue += (p.viewsCount || 0) * 0.12;
        adUnlocks += (p.viewsCount || 0);
      }
    });
    return { revenue, paidUnlocks, adUnlocks };
  }, [monetizationPosts]);
`;

code = code.replace(
    /const handleDeletePost =/g,
    derivedStr + '\n  const handleDeletePost ='
);

// 3. Header replacement
const targetHeader = `      <header className={styles.header}>
        <div className={styles.headerTextGroup}>
          <h1 className={styles.title}>Creator Performance Dashboard</h1>
          <p className={styles.subtitle}>
            Analyze real-time impressions, saves, likes, and generative prompt copy events across your published portfolio.
          </p>
          {user && (
            <div className={styles.timeFilterContainer}>
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
        </div>
      </header>`;

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

code = code.replace(targetHeader, newHeader);

// 4. Content Replacement
const contentStart = code.indexOf('<section className={styles.kpiGrid}>');
const contentEnd = code.indexOf('{postToDelete && (');

if (contentStart !== -1 && contentEnd !== -1) {
    const originalContent = code.substring(contentStart, contentEnd);
    // originalContent ends with `</>\n      )}\n\n      ` because of `{postToDelete &&` being after it.
    // Actually wait, let's just find exactly `<section className={styles.kpiGrid}>` to `</>\n      )}`
    
    // Instead of string index, let's use a regex that matches exactly the inside of the fragment.
    const innerMatch = code.match(/<section className=\{styles\.kpiGrid\}>[\s\S]*?(?=<\/>\s*\)\})/);
    
    if (innerMatch) {
        const perfContent = innerMatch[0];
        const newInner = `{activeTab === 'performance' ? (
            <>
              ${perfContent}
            </>
          ) : (
            <>
              <section className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Sparkles size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />
                    <span>Total Revenue Earned</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>\${monetizationStats.revenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Estimated overall earnings</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Copy size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />
                    <span>Total Paid Unlocks</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.paidUnlocks.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Direct prompt sales</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Eye size={18} className={styles.kpiIcon} style={{color: '#f59e0b'}} />
                    <span>Total Ad Unlocks</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.adUnlocks.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Monetized ad views</div>
                </div>
              </section>

              <div className={styles.tableHeader}>
                <h2 className={styles.sectionTitle}>
                  Monetized Posts ({monetizationPosts.length})
                </h2>
              </div>

              {monetizationPosts.length === 0 ? (
                <div className={styles.emptyState}>
                  <AlertTriangle size={48} className={styles.emptyIcon} />
                  <h3>No monetized artwork found</h3>
                  <p>You haven't set up any paid or ad-supported prompts yet.</p>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Artwork &amp; Title</th>
                        <th>Monetization</th>
                        <th className={styles.textRight}>Unlocks</th>
                        <th className={styles.textRight}>Revenue Earned</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monetizationPosts.map(post => {
                        const isPaid = post.monetizationType === 'charge';
                        const unlocks = isPaid ? (post.copiesCount || 0) : (post.viewsCount || 0);
                        const revenue = isPaid 
                          ? (unlocks * (post.price || 1.99)).toFixed(2) 
                          : (unlocks * 0.12).toFixed(2);
                        
                        return (
                          <tr key={post.id}>
                            <td>
                              <div className={styles.postInfo}>
                                <div className={styles.postThumbWrapper}>
                                  <img src={post.imageUrls[0]} alt={post.title} className={styles.postThumb} />
                                </div>
                                <div>
                                  <span className={styles.postTitle}>{post.title}</span>
                                  <span className={styles.postModel}>ID: {post.id.substring(0, 14)}...</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              {isPaid ? (
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                  ?? Paid ($\{post.price?.toFixed(2) || '1.99'})
                                </span>
                              ) : (
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                                  ?? Ad Unlock
                                </span>
                              )}
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 600 }}>
                              {unlocks.toLocaleString()}
                            </td>
                            <td className={styles.textRight} style={{ fontWeight: 600, color: '#10b981' }}>
                              $\${revenue}
                            </td>
                            <td>
                              <div className={styles.actionButtons}>
                                <Link to={\`/post/\${post.id}\`} className={styles.actionBtn} title="View Post">
                                  <ExternalLink size={16} />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}`;
          
        code = code.replace(innerMatch[0], newInner);
    }
}

fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Rebuilt CreatorDashboardPage successfully.');
