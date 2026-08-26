const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// We need to add showAuthModal to the state
if (!code.includes('showAuthModal')) {
  code = code.replace(/const \[showProfileMenu, setShowProfileMenu\] = useState\(false\);/, "const [showProfileMenu, setShowProfileMenu] = useState(false);\n  const [showAuthModal, setShowAuthModal] = useState(false);");
}

// Update the icon click handler
code = code.replace(/onClick=\{\(\) => setShowProfileMenu\(!showProfileMenu\)\}/g, "onClick={() => user ? setShowProfileMenu(!showProfileMenu) : setShowAuthModal(true)}");

// Update the dropdown to ONLY render if user exists
const oldDropdown = /\{showProfileMenu && \([\s\S]*?<GoogleSignInButton onSuccess=\{\(\) => setShowProfileMenu\(false\)\} \/>\r?\n\s*\}\r?\n\s*<\/div>\r?\n\s*\)\}/;

const newDropdown = `{user && showProfileMenu && (
                <div className={styles.dropdownMenu} style={{ right: 0, width: '220px', padding: '0.5rem' }}>
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
                </div>
              )}`;
code = code.replace(oldDropdown, newDropdown);

// Add the Auth Modal
const authModal = `
      {/* Auth Modal */}
      {!user && showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAuthModal(false)}>
          <div style={{ backgroundColor: '#0F0F11', padding: '2rem', borderRadius: '16px', border: '1px solid #27272a', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>Welcome Back</h2>
            <p style={{ margin: '0 0 1.5rem 0', color: '#a1a1aa', textAlign: 'center', fontSize: '0.9rem' }}>Sign in to continue to your dashboard and create prompts.</p>
            <GoogleSignInButton onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
`;

code = code.replace(/\{isFeedbackModalOpen && <FeedbackModal onClose=\{\(\) => setIsFeedbackModalOpen\(false\)\} \/>\}/, `{isFeedbackModalOpen && <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />}\n${authModal}`);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Updated Navbar to use Auth Modal");
