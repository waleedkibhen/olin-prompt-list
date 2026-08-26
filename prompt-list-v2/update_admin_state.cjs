const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

// Add imports
if (!code.includes('setDoc')) {
  code = code.replace(/updateDoc, deleteDoc, getDocs\s*\} from 'firebase\/firestore';/, `updateDoc, deleteDoc, getDocs, setDoc } from 'firebase/firestore';`);
}

// Add state
const stateTarget = `const [allUsers, setAllUsers] = useState<AdminUser[]>([]);`;
const stateReplacement = `const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [adPoolBalance, setAdPoolBalance] = useState<number>(0);
  const [adPoolInput, setAdPoolInput] = useState<string>('');
  const [totalPlatformAdViews, setTotalPlatformAdViews] = useState<number>(0);
  const [isUpdatingAdPool, setIsUpdatingAdPool] = useState<boolean>(false);
  const [isAdPoolLoading, setIsAdPoolLoading] = useState<boolean>(true);`;

code = code.replace(stateTarget, stateReplacement);

// Add fetch for adPool
const fetchTarget = `const unsubTickets = onSnapshot(collection(db, 'support_tickets')`;
const fetchReplacement = `const unsubAdPool = onSnapshot(doc(db, 'system', 'adPool'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdPoolBalance(data.totalBalance || 0);
        setTotalPlatformAdViews(data.totalPlatformAdViews || 0);
        setAdPoolInput((data.totalBalance || 0).toString());
      }
      setIsAdPoolLoading(false);
    });

    const unsubTickets = onSnapshot(collection(db, 'support_tickets')`;

code = code.replace(fetchTarget, fetchReplacement);

// Add cleanup for unsubAdPool
const cleanupTarget = `return () => {
      unsubPosts();
      unsubUsers();
      unsubTickets();
    };`;
const cleanupReplacement = `return () => {
      unsubPosts();
      unsubUsers();
      unsubTickets();
      unsubAdPool();
    };`;

code = code.replace(cleanupTarget, cleanupReplacement);

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Added Ad Pool state to AdminDashboardPage");
