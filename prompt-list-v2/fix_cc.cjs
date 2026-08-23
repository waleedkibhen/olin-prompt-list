const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

const t = `    const { title, price, promptId } = await context.request.json<any>();
    
    if (!title || typeof price !== "number" || !promptId) {`;
    
const r = `    const { title, price, promptId, userId } = await context.request.json<any>();
    
    if (!title || typeof price !== "number" || !promptId || !userId) {`;

code = code.replace(t, r);
fs.writeFileSync(p, code);
console.log('fixed create-checkout properly');
