const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

const funcTarget = `const handleToggleBan = async (targetUser: AdminUser) => {`;
const funcReplacement = `const handleUpdateAdPool = async () => {
    setIsUpdatingAdPool(true);
    try {
      const val = parseFloat(adPoolInput);
      if (isNaN(val) || val < 0) throw new Error("Invalid balance amount");
      
      const statsRef = doc(db, 'system', 'adPool');
      await setDoc(statsRef, { totalBalance: val }, { merge: true });
      toast.success(\`Successfully updated Adsterra Pool Balance to $\${val.toFixed(2)}\`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update pool balance");
    } finally {
      setIsUpdatingAdPool(false);
    }
  };

  const handleToggleBan = async (targetUser: AdminUser) => {`;

code = code.replace(funcTarget, funcReplacement);

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added handleUpdateAdPool function");
