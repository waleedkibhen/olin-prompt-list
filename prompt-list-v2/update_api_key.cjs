const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

code = code.replace(
  'const DEFAULT_WHOP_API_KEY = "apik_ehGz6NoKEOfQv_C5388822_C_4ef6b481f1f55c864cab889eeada81dda783fa0f1257ac1654cd863031830c";',
  'const DEFAULT_WHOP_API_KEY = "apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc";'
);

fs.writeFileSync(p, code);
console.log('updated api key');
