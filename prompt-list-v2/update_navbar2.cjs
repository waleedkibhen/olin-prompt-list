const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!code.includes('GoogleSignInButton')) {
  code = code.replace(/(import .*?;)\r?\n/, `$1\nimport GoogleSignInButton from '@/components/GoogleSignInButton';\n`);
}

code = code.replace(/onClick=\{\(\) => user \? setShowProfileMenu\(!showProfileMenu\) : signInWithGoogle\(\)\}/g, "onClick={() => setShowProfileMenu(!showProfileMenu)}");

const oldDropdown = /\{user && showProfileMenu && \([\s\S]*?<\/div>\r?\n\s*\)\}/;

const newDropdown = `{showProfileMenu && (
                <div className={styles.dropdownMenu} style={{ right: 0, width: user ? '220px' : '320px', padding: user ? '0.5rem' : '1.5rem' }}>
                  {user ? (
                    <>
                      <div className={styles.profileDropdownHeader}>
                        <img src={profile?.avatarUrl || user.photoURL || ''} alt="Avatar" className={styles.profileAvatar} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.displayName || user.displayName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{profile?.username}</span>
                        </div>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link to={\`/creator/\${profile?.username}\`} className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>My Profile</Link>
                      <Link to="/dashboard" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Creator Dashboard</Link>
                      <Link to="/settings" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Settings</Link>
                      <button className={styles.dropdownItem} onClick={() => { setIsFeedbackModalOpen(true); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }}>
                        Submit Feedback
                      </button>
                      {user.email === 'wisecrafts81@gmail.com' && (
                        <Link to="/admin" className={styles.dropdownItem} onClick={() => setShowProfileMenu(false)}>Superadmin Console</Link>
                      )}
                      <div className={styles.dropdownDivider} />
                      <button className={\`\${styles.dropdownItem} \${styles.signOutItem}\`} onClick={() => { signOut(); setShowProfileMenu(false); }} style={{ width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'none' }}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <GoogleSignInButton onSuccess={() => setShowProfileMenu(false)} />
                  )}
                </div>
              )}`;

code = code.replace(oldDropdown, newDropdown);
fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar to use GoogleSignInButton dropdown");
