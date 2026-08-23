const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const target = `  const [isUnlocked, setIsUnlocked] = useState(false);`;
const replace = `  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securePromptData, setSecurePromptData] = useState<{promptText: string, prompts: string[]} | null>(null);
  
  // Effect to fetch secure content if unlocked and needed
  useEffect(() => {
    if (isUnlocked && post.monetizationType === 'charge' && (!post.promptText || post.promptText === '')) {
      const fetchSecureContent = async () => {
        try {
          const docRef = doc(db, 'posts', post.id, 'secure_content', 'data');
          const docSnap = await import('firebase/firestore').then(m => m.getDoc(docRef));
          if (docSnap.exists()) {
            setSecurePromptData(docSnap.data() as any);
          }
        } catch (e) {
          console.error("Failed to fetch secure content", e);
        }
      };
      fetchSecureContent();
    }
  }, [isUnlocked, post.id, post.monetizationType, post.promptText]);
`;
code = code.replace(target, replace);
fs.writeFileSync(p, code);
console.log('added secure fetch effect');
