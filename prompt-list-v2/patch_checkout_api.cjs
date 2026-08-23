const fs = require('fs');
let code = fs.readFileSync('functions/api/whop/create-checkout.ts', 'utf8');

code = code.replace(`      checkoutId: whopData.id || (whopData.data && whopData.data.id)`, `      checkoutId: whopData.id || (whopData.data && whopData.data.id),
      purchaseUrl: whopData.purchase_url || (whopData.data && whopData.data.purchase_url)`);

fs.writeFileSync('functions/api/whop/create-checkout.ts', code);
console.log('patched create-checkout');
