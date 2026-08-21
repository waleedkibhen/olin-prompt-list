const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  'const companyId = context.env.WHOP_COMPANY_ID || "biz_YOUR_COMPANY_ID";',
  'const companyId = context.env.WHOP_COMPANY_ID || "biz_Cl76q9At9iiox0";'
);

fs.writeFileSync(p, code);
console.log('updated company id');
