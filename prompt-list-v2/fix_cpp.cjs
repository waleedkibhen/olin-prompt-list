const fs = require('fs');
const p = 'src/pages/CreatePostPage.tsx';
let code = fs.readFileSync(p, 'utf8');

const t = `            const whopRes = await fetch('/api/whop/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: title,
                price: pVal,
                promptId: newPostRef.id
              })
            });`;
const r = `            const whopRes = await fetch('/api/whop/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: title,
                price: pVal,
                promptId: newPostRef.id,
                userId: user.uid
              })
            });`;

code = code.replace(t, r);
fs.writeFileSync(p, code);
console.log('fixed CreatePostPage arguments');
