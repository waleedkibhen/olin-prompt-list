const fs = require('fs');

const newContent = `<section className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Sparkles size={18} className={styles.kpiIcon} style={{color: '#10b981'}} />
                    <span>Total Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>\${monetizationStats.totalRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Estimated overall earnings</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Lock size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />
                    <span>Paid Posts</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.paidPosts.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Charge-to-unlock prompts</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <DollarSign size={18} className={styles.kpiIcon} style={{color: '#3b82f6'}} />
                    <span>Paid Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>\${monetizationStats.paidRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Direct prompt sales</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <MonitorPlay size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />
                    <span>Ad Posts</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>{monetizationStats.adPosts.toLocaleString()}</div>
                  </div>
                  <div className={styles.kpiDesc}>Ad-supported prompts</div>
                </div>

                <div className={styles.kpiCard}>
                  <div className={styles.kpiTop}>
                    <Eye size={18} className={styles.kpiIcon} style={{color: '#8b5cf6'}} />
                    <span>Ad Revenue</span>
                  </div>
                  <div className={styles.kpiValueRow}>
                    <div className={styles.kpiValue}>\${monetizationStats.adRevenue.toFixed(2)}</div>
                  </div>
                  <div className={styles.kpiDesc}>Estimated monthly pool share</div>
                </div>
              </section>

              {showMonetizationInfo && (
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                  <div style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.25rem' }}>
                    <Info size={24} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>How Creator Monetization Works</h3>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                      <li><strong>Paid Prompts:</strong> You earn directly when users buy your prompt via Whop (minus platform fees).</li>
                      <li><strong>Ad-Supported Prompts:</strong> Prompts stay 100% free for viewers. Revenue is pooled and calculated at the end of each month based on your share of global page views.</li>
                      <li><strong>Payouts:</strong> Minimum withdrawal threshold is <strong>$10.00</strong>.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={() => setShowMonetizationInfo(false)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                    title="Dismiss"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              <div className={styles.tableHeader} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
                  Monetized Posts ({displayMonetizationPosts.length})
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '8px' }}>
                  <button 
                    onClick={() => setMonetizationFilter('all')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'all' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'all' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    All Monetized
                  </button>
                  <button 
                    onClick={() => setMonetizationFilter('paid')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'paid' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'paid' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    Paid Prompts
                  </button>
                  <button 
                    onClick={() => setMonetizationFilter('ad')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: monetizationFilter === 'ad' ? 'var(--bg-card)' : 'transparent', color: monetizationFilter === 'ad' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  >
                    Ad Prompts
                  </button>
                </div>
              </div>

              {displayMonetizationPosts.length === 0 ? (
                <div className={styles.emptyState}>
                  <AlertTriangle size={48} className={styles.emptyIcon} />
                  <h3>No artwork found</h3>
                  <p>Try adjusting your filter or setting up a monetized prompt.</p>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Artwork &amp; Title</th>
                        <th>Monetization</th>
                        <th className={styles.textRight}>
                          {monetizationFilter === 'paid' ? 'Purchases' : monetizationFilter === 'ad' ? 'Views' : 'Unlocks / Views'}
                        </th>
                        <th className={styles.textRight}>Revenue Earned</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayMonetizationPosts.map(post => {
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
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Lock size={12} /> Paid ($\{post.price?.toFixed(2) || '1.99'})
                                </span>
                              ) : (
                                <span className={styles.badgePill} style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <PlayCircle size={12} /> Ad Unlock
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
          )}
`;

let code = fs.readFileSync('src/pages/CreatorDashboardPage.tsx', 'utf8');
const oldBlock = fs.readFileSync('monetization_block_old.txt', 'utf8');
code = code.replace(oldBlock, newContent);
fs.writeFileSync('src/pages/CreatorDashboardPage.tsx', code);
console.log('Replaced monetization block successfully');
