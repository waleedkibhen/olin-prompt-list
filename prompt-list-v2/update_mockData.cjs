const fs = require('fs');
const p = 'src/lib/mockData.ts';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  /price\?: number;/,
  "price?: number;\n  whopPlanId?: string;"
);

fs.writeFileSync(p, code);
console.log('updated mockData schema');
