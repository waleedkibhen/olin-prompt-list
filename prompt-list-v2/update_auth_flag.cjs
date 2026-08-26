const fs = require('fs');

// 1. Update AuthContext to set flag
let authCode = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
authCode = authCode.replace(/const signInWithGoogle = async \(\) => \{[\s\S]*?try \{/, `const signInWithGoogle = async () => {
    try {
      (window as any)._allowPopups = true;`);
      
authCode = authCode.replace(/toast\.error\(\`Sign-in failed: \$\{error\.message \|\| 'Unknown error'\}\`\);\r?\n\s*\}\r?\n\s*\}/, `toast.error(\`Sign-in failed: \${error.message || 'Unknown error'}\`);
        }
      } finally {
        (window as any)._allowPopups = false;
      }`);
fs.writeFileSync('src/context/AuthContext.tsx', authCode);
console.log("Updated AuthContext");

// 2. Update GlobalAdManager to read flag
let adCode = fs.readFileSync('src/components/GlobalAdManager.tsx', 'utf8');
adCode = adCode.replace(/const isModalOpen = document\.body\.classList\.contains\('post-modal-open'\);\r?\n\s*if \(!isDashboard && !isModalOpen\) \{/, `const isModalOpen = document.body.classList.contains('post-modal-open');
        const isAllowed = isDashboard || isModalOpen || (window as any)._allowPopups;
        if (!isAllowed) {`);
fs.writeFileSync('src/components/GlobalAdManager.tsx', adCode);
console.log("Updated GlobalAdManager");
