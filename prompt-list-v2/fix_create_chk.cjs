const fs = require('fs');
const p = 'functions/api/whop/create-checkout.ts';
let code = fs.readFileSync(p, 'utf8');

const t = `  export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
      const { title, price, promptId } = await context.request.json<any>();
      
      if (!title || typeof price !== "number" || !promptId) {`;
      
const r = `  export const onRequestPost: PagesFunction<Env> = async (context) => {
    try {
      const { title, price, promptId, userId } = await context.request.json<any>();
      
      if (!title || typeof price !== "number" || !promptId || !userId) {`;
code = code.replace(t, r);

const t2 = `        metadata: {
          prompt_id: promptId,
          title: title
        }`;
const r2 = `        metadata: {
          prompt_id: promptId,
          user_id: userId,
          title: title
        }`;
code = code.replace(t2, r2);

fs.writeFileSync(p, code);
console.log('fixed create-checkout params');
