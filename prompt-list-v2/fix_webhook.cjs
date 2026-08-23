const fs = require('fs');
let code = fs.readFileSync('functions/api/whop/webhook.ts', 'utf8');

code = code.replace(`if (payload.action !== "payment.succeeded") {`, `if (payload.action !== "payment.succeeded" && payload.type !== "payment.succeeded") {`);

fs.writeFileSync('functions/api/whop/webhook.ts', code);
console.log('Fixed payload type check');
