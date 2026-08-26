const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboardPage.tsx', 'utf8');

// Fix duplicate imports
code = code.replace(/import \{ getAggregateFromServer, sum \} from 'firebase\/firestore';\r?\nimport \{ getAggregateFromServer, sum \} from 'firebase\/firestore';/, "import { getAggregateFromServer, sum } from 'firebase/firestore';");

// Fix catch(e) typing
code = code.replace(/} catch\(e\) {/, "} catch(e: any) {");

fs.writeFileSync('src/pages/AdminDashboardPage.tsx', code);
console.log("Fixed AdminDashboardPage TS errors");
