const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `  // Check lock status
  useEffect(() => {
    let unlocked = false;
    
    // Always unlock for the creator
    if (user && post.creatorId === user.uid) {
      unlocked = true;
    } else if (post.monetizationType !== 'charge') {
      unlocked = true;
    } else {
      // Check local storage for unlocked prompts
      try {
        const unlockedRaw = localStorage.getItem('unlockedPrompts');
        const unlockedPrompts = unlockedRaw ? JSON.parse(unlockedRaw) : [];
        if (unlockedPrompts.includes(post.id)) {
          unlocked = true;
        }
      } catch (e) {}
    }
    
    setIsUnlocked(unlocked);
  }, [post.id, post.creatorId, post.monetizationType, user]);`;

const replace = `  // Check lock status
  useEffect(() => {
    let unlocked = false;
    
    const checkStatus = async () => {
      // Always unlock for the creator
      if (user && post.creatorId === user.uid) {
        unlocked = true;
      } else if (post.monetizationType !== 'charge') {
        unlocked = true;
      } else {
        // Check local storage for unlocked prompts
        try {
          const unlockedRaw = localStorage.getItem('unlockedPrompts');
          const unlockedPrompts = unlockedRaw ? JSON.parse(unlockedRaw) : [];
          if (unlockedPrompts.includes(post.id)) {
            unlocked = true;
          }
        } catch (e) {}
        
        // Also check server if logged in
        if (!unlocked && user) {
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.purchasedPrompts && data.purchasedPrompts.includes(post.id)) {
                unlocked = true;
                // Sync to local storage
                try {
                  const unlockedRaw = localStorage.getItem('unlockedPrompts');
                  const unlockedPrompts = unlockedRaw ? JSON.parse(unlockedRaw) : [];
                  if (!unlockedPrompts.includes(post.id)) {
                    unlockedPrompts.push(post.id);
                    localStorage.setItem('unlockedPrompts', JSON.stringify(unlockedPrompts));
                  }
                } catch(e) {}
              }
            }
          } catch(e) {
            console.error("Failed to check server purchased items", e);
          }
        }
      }
      
      setIsUnlocked(unlocked);
    };
    checkStatus();
  }, [post.id, post.creatorId, post.monetizationType, user]);`;

code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('fixed lock status check');
