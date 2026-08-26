import { initializeApp } from "firebase/app";
import { getFirestore, collection, getAggregateFromServer, sum, doc, updateDoc, setDoc } from "firebase/firestore";
import fs from "fs";

// Load firebase config from src/lib/firebase.ts by parsing it
const firebaseFile = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const configMatch = firebaseFile.match(/const firebaseConfig = ({[\s\S]*?});/);
if (!configMatch) throw new Error("Could not find firebase config");

// Evaluate the config object
let configStr = configMatch[1];
// Ensure keys are quoted for JSON parsing if necessary, or just eval it
const firebaseConfig = eval('(' + configStr + ')');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Recalculating global ad pool views...");
  
  // Aggregate query costs exactly 1 read, regardless of how many posts exist!
  const agg = await getAggregateFromServer(collection(db, 'posts'), {
    totalViews: sum('viewsCount')
  });
  
  const totalViews = agg.data().totalViews;
  console.log("Total platform views across all posts: " + totalViews);
  
  const poolRef = doc(db, 'system', 'adPool');
  await setDoc(poolRef, { totalPlatformAdViews: totalViews }, { merge: true });
  
  console.log("Successfully updated adPool.totalPlatformAdViews!");
  process.exit(0);
}

run().catch(console.error);
