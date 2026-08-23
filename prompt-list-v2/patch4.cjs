const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const t = `  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);`;
const r = `  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [securePromptData, setSecurePromptData] = useState<{promptText?: string, prompts?: string[]} | null>(null);

  useEffect(() => {
    if (isUnlocked && post.monetizationType === 'charge' && !post.promptText) {
      const fetchSecure = async () => {
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
      fetchSecure();
    }
  }, [isUnlocked, post.id, post.monetizationType, post.promptText]);`;

code = code.replace(t, r);
fs.writeFileSync(p, code);
console.log('Added securePromptData state and effect');
