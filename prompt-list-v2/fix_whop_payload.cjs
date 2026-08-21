const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

const targetUrl = '"https://api.whop.com/api/v2/checkout_configurations"';
code = code.replace(targetUrl, '"https://api.whop.com/api/v1/checkout_configurations"');

const targetPayload = `      body: JSON.stringify({
        company_id: companyId,
        mode: "payment",
        currency: "usd",
        plan: {
          initial_price: price,
          plan_type: "one_time"
        },
        metadata: {
          prompt_id: promptId,
          title: title
        }
      })`;
      
const replacePayload = `      body: JSON.stringify({
        mode: "payment",
        plan: {
          company_id: companyId,
          currency: "usd",
          initial_price: price,
          plan_type: "one_time"
        },
        metadata: {
          prompt_id: promptId,
          title: title
        }
      })`;

code = code.replace(targetPayload, replacePayload);

fs.writeFileSync(p, code);
console.log('fixed whop api payload');
