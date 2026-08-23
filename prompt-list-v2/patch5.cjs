const fs = require('fs');
const p = 'src/components/PromptCard.tsx';
let code = fs.readFileSync(p, 'utf8');

const t = `  const [previewPaywall, setPreviewPaywall] = useState(false);
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

// Remove it from current location
code = code.replace(t, `  const [previewPaywall, setPreviewPaywall] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);`);

// Put it before effectivePrompts
const t2 = `const effectivePrompts = useMemo(() => {`;
const r2 = `  const [securePromptData, setSecurePromptData] = useState<{promptText?: string, prompts?: string[]} | null>(null);

  useEffect(() => {
    if (isUnlocked && post.monetizationType === 'charge' && !post.promptText) {
      const fetchSecure = async () => {
        try {
          const { getDoc, doc } = await import('firebase/firestore');
          const docRef = doc(db, 'posts', post.id, 'secure_content', 'data');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setSecurePromptData(docSnap.data() as any);
          }
        } catch (e) {
          console.error("Failed to fetch secure content", e);
        }
      };
      fetchSecure();
    }
  }, [isUnlocked, post.id, post.monetizationType, post.promptText]);

  const effectivePrompts = useMemo(() => {`;
  
code = code.replace(t2, r2);

// Fix TS implicitly has any type
code = code.replace(`availableTabs = effectivePrompts.map((_, i) => \`prompt-\${i}\`);`, `availableTabs = effectivePrompts.map((_: any, i: number) => \`prompt-\${i}\`);`);

fs.writeFileSync(p, code);
console.log('moved state');
