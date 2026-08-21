const fs = require('fs');
const p = 'src/pages/PostDetailPage.tsx';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  "price: d.price || 0,",
  "price: d.price || 0,\n            whopPlanId: d.whopPlanId || undefined,"
);

fs.writeFileSync(p, code);
console.log('fixed post detail');
