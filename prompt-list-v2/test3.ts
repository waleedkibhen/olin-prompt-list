import { initializeApp } from "firebase/app";
import { getFirestore, collection, getAggregateFromServer, sum, count, query, where } from "firebase/firestore";
import fs from "fs";

const firebaseFile = fs.readFileSync('src/lib/firebase.ts', 'utf8');
const configMatch = firebaseFile.match(/const firebaseConfig = ({[\s\S]*?});/);
let configStr = configMatch[1];
configStr = configStr.replace(/env\.[A-Z_]+\s*\|\|\s*env\.[A-Z_]+\s*\|\|\s*/g, '');
const firebaseConfig = eval('(' + configStr + ')');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const aggQuery = query(collection(db, "posts"), where("creatorId", "==", "8gN3s1tKz5dK1B2Y4Q7G6A5V1U8Z"));
    const snap = await getAggregateFromServer(aggQuery, {
      views: sum('viewsCount'),
      totalPosts: count()
    });
    console.log("Success with where:", snap.data());
  } catch(e) {
    console.error("Error with where:", e);
  }
  process.exit(0);
}
run();
