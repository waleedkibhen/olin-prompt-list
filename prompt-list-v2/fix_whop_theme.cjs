const fs = require('fs');
let code = fs.readFileSync('src/components/WhopCheckoutModal.tsx', 'utf8');

code = code.replace(
  '<WhopCheckoutEmbed \n            planId={planId} \n            returnUrl={window.location.href}',
  '<WhopCheckoutEmbed \n            planId={planId} \n            theme="dark"\n            returnUrl={window.location.href}'
);

fs.writeFileSync('src/components/WhopCheckoutModal.tsx', code);
console.log("Added dark theme to WhopCheckoutEmbed");
